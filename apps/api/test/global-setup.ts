import { execFileSync } from "node:child_process";
import pg from "pg";
import { TEST_DATABASE_URL as DATABASE_URL } from "./test-database-url.js";

/** Cria o banco de teste, separado do de desenvolvimento, e aplica as migrations nele (ADR-007). */
export default async function setup(): Promise<void> {
  const url = new URL(DATABASE_URL);
  const database = url.pathname.slice(1);
  if (!database.endsWith("_test"))
    throw new Error(`O banco de teste deve terminar em _test, veio "${database}"`);

  url.pathname = "/postgres";
  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
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
}
