import { cruise } from "dependency-cruiser";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const ruleSet = require("../../../../.dependency-cruiser.cjs");

describe("regra do pacote compartilhado: sem Node nem framework", () => {
  let workdir: string;

  beforeAll(() => {
    workdir = mkdtempSync(join(tmpdir(), "leguele-arch-shared-"));
    const sharedDir = join(workdir, "packages/shared/src");
    mkdirSync(sharedDir, { recursive: true });
    writeFileSync(join(sharedDir, "usa-node.ts"), 'import "node:fs";\n');
    writeFileSync(join(sharedDir, "usa-nest.ts"), 'import "@nestjs/common";\n');
    writeFileSync(join(sharedDir, "usa-prisma.ts"), 'import "@prisma/client";\n');
    // Sem node_modules na fixture o import resolve como "unknown" e a regra pode disparar por engano.
    for (const pacote of ["@nestjs/common", "@prisma/client"]) {
      const pacoteDir = join(workdir, "node_modules", pacote);
      mkdirSync(pacoteDir, { recursive: true });
      writeFileSync(
        join(pacoteDir, "package.json"),
        JSON.stringify({ name: pacote, main: "index.js" }),
      );
      writeFileSync(join(pacoteDir, "index.js"), "module.exports = {};");
    }
    writeFileSync(join(sharedDir, "puro.ts"), "export const valor = 1;\n");
    // Teste do pacote pode importar Node: a regra vale só para o código que vai ao navegador.
    writeFileSync(join(sharedDir, "usa-node.test.ts"), 'import "node:fs";\n');
  });

  afterAll(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  async function violacoes(): Promise<{ from: string; rule: string }[]> {
    const result = await cruise(["packages"], {
      ...ruleSet.options,
      ruleSet,
      validate: true,
      baseDir: workdir,
    });
    if (typeof result.output === "string") throw new Error("saída inesperada");
    return result.output.summary.violations.map((v) => ({ from: v.from, rule: v.rule.name }));
  }

  it.each([
    ["usa-node", "shared-sem-node-nem-framework"],
    ["usa-nest", "shared-sem-framework"],
    ["usa-prisma", "shared-sem-framework"],
  ])("reprova %s.ts em packages/shared", async (arquivo, regra) => {
    const encontradas = await violacoes();

    expect(encontradas).toContainEqual({ from: `packages/shared/src/${arquivo}.ts`, rule: regra });
  });

  it("aceita um arquivo puro e os testes do pacote", async () => {
    const origens = (await violacoes()).map((v) => v.from);

    expect(origens).not.toContain("packages/shared/src/puro.ts");
    expect(origens).not.toContain("packages/shared/src/usa-node.test.ts");
  });
});
