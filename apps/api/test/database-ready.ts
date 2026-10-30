/** Falha com instrução clara quando o Postgres do teste não responde (nenhum teste é pulado em silêncio). */
export async function ensureDatabaseReachable(connect: () => Promise<void>): Promise<void> {
  try {
    await connect();
  } catch (error) {
    const failure = new Error(
      "O banco de teste não respondeu. Suba o Supabase local com `pnpm db:start` (Docker rodando) ou confira TEST_DATABASE_URL.",
      { cause: error },
    );
    // O Vitest 5 trava ao interpretar o stack de erros do globalSetup (source map do SWC) e esconde a mensagem.
    failure.stack = failure.message;
    throw failure;
  }
}
