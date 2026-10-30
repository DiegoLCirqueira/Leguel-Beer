// Falha se o schema do Prisma tiver mudanças sem migration (usado no CI).
import { spawnSync } from "node:child_process";

function prisma(...args) {
  return spawnSync("pnpm", ["exec", "prisma", ...args], { stdio: "inherit", shell: true });
}

if (prisma("migrate", "deploy").status !== 0) process.exit(1);

const diff = prisma(
  "migrate",
  "diff",
  "--from-config-datasource",
  "--to-schema",
  "prisma/schema.prisma",
  "--exit-code",
);
if (diff.status === 0) {
  console.log("Schema e migrations estão em sincronia.");
} else {
  console.error(
    "\nO schema do Prisma tem mudanças sem migration. Rode `pnpm db:migrate` e commite a migration gerada.",
  );
  process.exit(1);
}
