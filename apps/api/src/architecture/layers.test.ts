import { cruise } from "dependency-cruiser";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const ruleSet = require("../../../../.dependency-cruiser.cjs");

const LAYERS = ["domain", "application", "infrastructure", "presentation"] as const;
const MODULE_DIR = "apps/api/src/modules/exemplo";

describe("regra de camadas: dependências só para dentro", () => {
  let workdir: string;

  beforeAll(() => {
    workdir = mkdtempSync(join(tmpdir(), "leguele-layers-"));
    for (const layer of LAYERS) {
      mkdirSync(join(workdir, MODULE_DIR, layer), { recursive: true });
      writeFileSync(join(workdir, MODULE_DIR, layer, "alvo.ts"), "export const alvo = 1;\n");
    }
    const cases: [string, string][] = [
      ["domain", "application"],
      ["domain", "infrastructure"],
      ["domain", "presentation"],
      ["application", "infrastructure"],
      ["application", "presentation"],
      ["application", "domain"],
      ["infrastructure", "domain"],
      ["infrastructure", "application"],
      ["presentation", "application"],
    ];
    for (const [from, to] of cases) {
      writeFileSync(
        join(workdir, MODULE_DIR, from, `importa-${to}.ts`),
        `import { alvo } from "../${to}/alvo.js";\nexport const usado = alvo;\n`,
      );
    }
  });

  afterAll(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  async function violatingFiles(): Promise<string[]> {
    const result = await cruise(["apps"], {
      ...ruleSet.options,
      ruleSet,
      validate: true,
      baseDir: workdir,
    });
    if (typeof result.output === "string") throw new Error("saída inesperada");
    return result.output.summary.violations.map((v) => v.from);
  }

  it.each([
    ["domain", "application"],
    ["domain", "infrastructure"],
    ["domain", "presentation"],
    ["application", "infrastructure"],
    ["application", "presentation"],
  ])("reprova %s importando %s", async (from, to) => {
    expect(await violatingFiles()).toContain(`${MODULE_DIR}/${from}/importa-${to}.ts`);
  });

  it.each([
    ["application", "domain"],
    ["infrastructure", "domain"],
    ["infrastructure", "application"],
    ["presentation", "application"],
  ])("aceita %s importando %s", async (from, to) => {
    expect(await violatingFiles()).not.toContain(`${MODULE_DIR}/${from}/importa-${to}.ts`);
  });
});
