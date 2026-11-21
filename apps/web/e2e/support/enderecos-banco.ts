import { execFileSync } from "node:child_process";

export type EnderecoDeTeste = {
  apelido?: string;
  padrao?: boolean;
  /** Distância de rota até a cervejaria; 5200 dá frete de R$ 13,00 e acima de 25000 fica fora da área. */
  distanciaMetros?: number;
};

/** Roda SQL no banco da API: no CI, o service container (DATABASE_URL); no local, o Postgres do Supabase no Docker. */
function rodarSql(sql: string) {
  if (process.env.DATABASE_URL) execFileSync("psql", [process.env.DATABASE_URL, "-c", sql]);
  else
    execFileSync("docker", [
      "exec",
      "supabase_db_leguele-beer",
      "psql",
      "-U",
      "postgres",
      "-c",
      sql,
    ]);
}

/**
 * O cadastro pela API chama o serviço de mapas, que o E2E não tem: o endereço entra direto no banco.
 * O perfil nasce no primeiro acesso, então chame depois de entrar na conta.
 */
export function inserirEndereco(
  email: string,
  { apelido = "Casa", padrao = true, distanciaMetros = 5200 }: EnderecoDeTeste = {},
) {
  rodarSql(
    `insert into addresses (id, profile_id, nickname, zip, street, number, district, city, state, is_default, latitude, longitude, distance_meters, route_origin_latitude, route_origin_longitude, updated_at) select gen_random_uuid(), id, '${apelido}', '57035000', 'Avenida Fernandes Lima', '100', 'Farol', 'Maceió', 'AL', ${padrao}, -9.64, -35.73, ${distanciaMetros}, -9.6649, -35.7313, now() from profiles where email = '${email}'`,
  );
}
