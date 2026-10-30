import { execFileSync } from "node:child_process";
import pg from "pg";

const DATABASE_URL = process.env["DATABASE_URL"];

/** Cria o banco de teste, separado do de desenvolvimento, e aplica as migrations nele (ADR-007). */
export default async function setup(): Promise<void> {
  if (!DATABASE_URL) throw new Error("DATABASE_URL de teste não definida");
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
    env: process.env,
  });
}
