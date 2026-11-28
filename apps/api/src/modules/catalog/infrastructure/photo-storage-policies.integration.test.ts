import { readFileSync } from "node:fs";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

/**
 * As políticas do armazenamento só existem no Supabase (esquema `storage` e papéis `anon` e
 * `authenticated`), então o teste roda no Postgres do Supabase local, dentro de uma transação que
 * nunca é confirmada ([[ADR-017-fotos-com-sessao-do-admin]]).
 */
const STORAGE_DB_URL =
  process.env.TEST_STORAGE_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const MIGRATION = readFileSync(
  new URL(
    "../../../../prisma/migrations/20261128170000_photo_storage_policies/migration.sql",
    import.meta.url,
  ),
  "utf-8",
);

describe("buckets e políticas das fotos das cervejas (Supabase local)", () => {
  const client = new pg.Client({ connectionString: STORAGE_DB_URL });
  const adminId = crypto.randomUUID();
  const customerId = crypto.randomUUID();

  beforeAll(async () => {
    await client.connect();
  });
  afterAll(() => client.end());

  beforeEach(async () => {
    await client.query("ROLLBACK");
    await client.query("BEGIN");
    await client.query(MIGRATION);
    await client.query(
      `INSERT INTO public.profiles (id, email, role, updated_at) VALUES ($1, 'adm-pol@x.test', 'ADMIN', now()), ($2, 'cli-pol@x.test', 'CUSTOMER', now())`,
      [adminId, customerId],
    );
  });

  const asUser = async (id: string | null) => {
    await client.query("RESET ROLE");
    await client.query(`SET LOCAL ROLE ${id ? "authenticated" : "anon"}`);
    await client.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify(id ? { sub: id, role: "authenticated" } : { role: "anon" }),
    ]);
  };

  const attempt = async (sql: string, params: unknown[] = []) => {
    await client.query("SAVEPOINT tentativa");
    try {
      const result = await client.query(sql, params);
      await client.query("RELEASE SAVEPOINT tentativa");
      return { ok: true as const, rows: result.rowCount ?? 0 };
    } catch (error) {
      await client.query("ROLLBACK TO SAVEPOINT tentativa");
      return { ok: false as const, message: (error as Error).message };
    }
  };

  // O armazenamento recusa DELETE direto em SQL; a API dele liga este setting. As políticas valem igual.
  const allowDelete = () =>
    client.query(`SELECT set_config('storage.allow_delete_query', 'true', true)`);

  const upload = (bucket: string, name: string) =>
    attempt(`INSERT INTO storage.objects (bucket_id, name) VALUES ($1, $2)`, [bucket, name]);

  it("cria o bucket de envio privado e o das fotos público, os dois só com WebP de até 40 KB", async () => {
    const { rows } = await client.query(
      `SELECT id, public, file_size_limit, allowed_mime_types FROM storage.buckets WHERE id IN ('cervejas-envio', 'cervejas') ORDER BY id`,
    );

    expect(rows).toEqual([
      {
        id: "cervejas",
        public: true,
        file_size_limit: "40960",
        allowed_mime_types: ["image/webp"],
      },
      {
        id: "cervejas-envio",
        public: false,
        file_size_limit: "40960",
        allowed_mime_types: ["image/webp"],
      },
    ]);
  });

  it("o admin grava nos dois buckets; o cliente comum e o visitante, em nenhum", async () => {
    await asUser(adminId);
    expect((await upload("cervejas-envio", "a.webp")).ok).toBe(true);
    expect((await upload("cervejas", "b.webp")).ok).toBe(true);

    await asUser(customerId);
    expect((await upload("cervejas-envio", "c.webp")).ok).toBe(false);
    expect((await upload("cervejas", "d.webp")).ok).toBe(false);

    await asUser(null);
    expect((await upload("cervejas-envio", "e.webp")).ok).toBe(false);
    expect((await upload("cervejas", "f.webp")).ok).toBe(false);
  });

  it("só o admin lê e apaga o envio privado; ninguém sobrescreve", async () => {
    await client.query(
      `INSERT INTO storage.objects (bucket_id, name) VALUES ('cervejas-envio', 'x.webp')`,
    );

    await asUser(customerId);
    expect(
      await attempt(`SELECT name FROM storage.objects WHERE bucket_id = 'cervejas-envio'`),
    ).toMatchObject({ rows: 0 });
    await allowDelete();
    expect(await attempt(`DELETE FROM storage.objects WHERE name = 'x.webp'`)).toMatchObject({
      rows: 0,
    });

    await asUser(adminId);
    expect(
      await attempt(`SELECT name FROM storage.objects WHERE bucket_id = 'cervejas-envio'`),
    ).toMatchObject({ rows: 1 });
    expect(
      await attempt(`UPDATE storage.objects SET name = 'y.webp' WHERE name = 'x.webp'`),
    ).toMatchObject({ rows: 0 });
    await allowDelete();
    expect(await attempt(`DELETE FROM storage.objects WHERE name = 'x.webp'`)).toMatchObject({
      rows: 1,
    });
  });

  it("is_admin() responde pelo papel no banco, sem abrir a tabela de perfis ao papel authenticated", async () => {
    await asUser(adminId);
    expect((await client.query(`SELECT app_guard.is_admin() AS admin`)).rows[0]).toEqual({
      admin: true,
    });
    await asUser(customerId);
    expect((await client.query(`SELECT app_guard.is_admin() AS admin`)).rows[0]).toEqual({
      admin: false,
    });
    await asUser(null);
    expect((await client.query(`SELECT app_guard.is_admin() AS admin`)).rows[0]).toEqual({
      admin: false,
    });
  });
});
