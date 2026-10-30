/** Falha com instrução clara quando o Postgres do teste não responde (nenhum teste é pulado em silêncio). */
export async function ensureDatabaseReachable(connect: () => Promise<void>): Promise<void> {
  try {
    await connect();
  } catch (error) {
    throw new Error(
      "O banco de teste não respondeu. Suba o Supabase local com `pnpm db:start` (Docker rodando) ou confira TEST_DATABASE_URL.",
      { cause: error },
    );
  }
}
