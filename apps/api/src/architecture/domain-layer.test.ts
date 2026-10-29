import { cruise } from "dependency-cruiser";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const ruleSet = require("../../../../.dependency-cruiser.cjs");

describe("regra de camadas: domain não importa framework", () => {
  let workdir: string;

  beforeAll(() => {
    workdir = mkdtempSync(join(tmpdir(), "leguele-arch-"));
    const domainDir = join(workdir, "apps/api/src/modules/exemplo/domain");
    mkdirSync(domainDir, { recursive: true });
    writeFileSync(join(domainDir, "usa-nest.ts"), 'import "@nestjs/common";\n');
    writeFileSync(join(domainDir, "usa-prisma.ts"), 'import "@prisma/client";\n');
    writeFileSync(join(domainDir, "puro.ts"), "export const valor = 1;\n");
  });

  afterAll(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  async function violacoes(): Promise<{ from: string; rule: string }[]> {
    const result = await cruise(["apps"], { ...ruleSet.options, ruleSet, validate: true, baseDir: workdir });
    if (typeof result.output === "string") throw new Error("saída inesperada");
    return result.output.summary.violations.map((v) => ({ from: v.from, rule: v.rule.name }));
  }

  it.each(["usa-nest", "usa-prisma"])("reprova %s.ts na pasta domain", async (arquivo) => {
    const encontradas = await violacoes();

    expect(encontradas).toContainEqual({
      from: `apps/api/src/modules/exemplo/domain/${arquivo}.ts`,
      rule: "domain-sem-framework",
    });
  });

  it("aceita um arquivo puro na pasta domain", async () => {
    const encontradas = await violacoes();

    expect(encontradas.map((v) => v.from)).not.toContain("apps/api/src/modules/exemplo/domain/puro.ts");
  });
});
