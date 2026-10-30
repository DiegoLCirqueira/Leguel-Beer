/** Banco de teste separado do de desenvolvimento, no mesmo Postgres (ADR-007). */
export const TEST_DATABASE_URL =
  process.env["TEST_DATABASE_URL"] ?? "postgresql://postgres:postgres@127.0.0.1:54322/leguele_test";
