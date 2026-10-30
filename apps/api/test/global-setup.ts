import { execFileSync } from "node:child_process";
import pg from "pg";
import { assertTestDatabase } from "./database-guard.js";
import { ensureDatabaseReachable } from "./database-ready.js";
import { TEST_DATABASE_URL as DATABASE_URL } from "./test-database-url.js";

/** Cria o banco de teste, separado do de desenvolvimento, e aplica as migrations nele (ADR-007). */
export default async function setup(): Promise<void> {
  const url = new URL(DATABASE_URL);
  const database = url.pathname.slice(1);
  try {
    assertTestDatabase(DATABASE_URL, [process.env["DATABASE_URL"], process.env["DIRECT_URL"]]);
  } catch (error) {
    // Vitest 5 esconde a mensagem quando o stack do globalSetup passa pelo source map do SWC.
    (error as Error).stack = (error as Error).message;
    throw error;
  }

  url.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: url.toString() });
  await ensureDatabaseReachable(() => admin.connect());
  try {
    const found = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);
    if (found.rowCount === 0) await admin.query(`CREATE DATABASE "${database}"`);
  } finally {
    await admin.end();
  }

  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, DATABASE_URL, DIRECT_URL: DATABASE_URL },
  });

  // No Supabase o schema auth já existe; no banco de teste, um Postgres comum, entra só o mínimo
  // que a API lê (id e email_confirmed_at de auth.users).
  const testDb = new pg.Client({ connectionString: DATABASE_URL });
  await testDb.connect();
  try {
    await testDb.query("CREATE SCHEMA IF NOT EXISTS auth");
    await testDb.query(
      "CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY, email text, email_confirmed_at timestamptz)",
    );
  } finally {
    await testDb.end();
  }
}
