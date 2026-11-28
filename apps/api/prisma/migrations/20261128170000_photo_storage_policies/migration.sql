-- Fotos das cervejas no armazenamento do Supabase (ADR-017): dois buckets e a política que só deixa
-- o admin (papel no banco) gravar neles e ler/apagar no de envio. Ninguém sobrescreve (nenhuma
-- política de UPDATE) e a escrita pública é negada.

-- O papel vem do banco, nunca de um campo do token. A função devolve só um booleano: a tabela de
-- perfis não é aberta ao papel `authenticated`. Ela mora num esquema só dela (`app_guard`), porque
-- o `authenticated` pode não ter acesso ao esquema `public`. O `sub` do token é lido do mesmo setting que o
-- Supabase usa (`request.jwt.claims`), então a função também existe fora do Supabase (sem usuário).
CREATE SCHEMA IF NOT EXISTS app_guard;

CREATE OR REPLACE FUNCTION app_guard.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT p.role = 'ADMIN'
     FROM public.profiles p
     WHERE p.id = NULLIF(NULLIF(current_setting('request.jwt.claims', true), '')::json ->> 'sub', '')::uuid),
    false)
$$;

REVOKE ALL ON SCHEMA app_guard FROM PUBLIC;
REVOKE ALL ON FUNCTION app_guard.is_admin() FROM PUBLIC;

DO $storage$
BEGIN
  -- Fora do Supabase (o banco de testes comum) não há esquema `storage` nem papéis: nada a fazer.
  IF to_regnamespace('storage') IS NULL THEN
    RAISE NOTICE 'Sem o esquema storage: buckets e políticas ficam para o Supabase.';
    RETURN;
  END IF;

  GRANT USAGE ON SCHEMA app_guard TO anon, authenticated;
  GRANT EXECUTE ON FUNCTION app_guard.is_admin() TO anon, authenticated;

  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES
    ('cervejas-envio', 'cervejas-envio', false, 40960, ARRAY['image/webp']),
    ('cervejas', 'cervejas', true, 40960, ARRAY['image/webp'])
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

  DROP POLICY IF EXISTS "admin grava no envio das fotos" ON storage.objects;
  DROP POLICY IF EXISTS "admin le o envio das fotos" ON storage.objects;
  DROP POLICY IF EXISTS "admin apaga o envio das fotos" ON storage.objects;
  DROP POLICY IF EXISTS "admin publica as fotos" ON storage.objects;

  CREATE POLICY "admin grava no envio das fotos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'cervejas-envio' AND app_guard.is_admin());
  CREATE POLICY "admin le o envio das fotos" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'cervejas-envio' AND app_guard.is_admin());
  CREATE POLICY "admin apaga o envio das fotos" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'cervejas-envio' AND app_guard.is_admin());
  CREATE POLICY "admin publica as fotos" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'cervejas' AND app_guard.is_admin());
END
$storage$;
