import { cruise } from "dependency-cruiser";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const ruleSet = require("../../../../.dependency-cruiser.cjs");

const APP_DIR = "apps/api/src/modules/exemplo/application";

describe("regra de camadas: application não importa framework nem infra comum", () => {
  let workdir: string;

  beforeAll(() => {
    workdir = mkdtempSync(join(tmpdir(), "leguele-app-"));
    mkdirSync(join(workdir, APP_DIR), { recursive: true });
    mkdirSync(join(workdir, "apps/api/src/common/prisma"), { recursive: true });
    writeFileSync(
      join(workdir, "apps/api/src/common/prisma/prisma.service.ts"),
      "export const prisma = 1;\n",
    );
    // Com node_modules na fixture os imports resolvem como "npm", como no repositório real.
    for (const pacote of ["@nestjs/common", "@prisma/client", "zod"]) {
      const dir = join(workdir, "node_modules", pacote);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "package.json"), JSON.stringify({ name: pacote, main: "index.js" }));
      writeFileSync(join(dir, "index.js"), "module.exports = {};");
    }
    writeFileSync(join(workdir, APP_DIR, "usa-nest.ts"), 'import "@nestjs/common";\n');
    writeFileSync(join(workdir, APP_DIR, "usa-prisma.ts"), 'import "@prisma/client";\n');
    writeFileSync(
      join(workdir, APP_DIR, "usa-common.ts"),
      'import "../../../common/prisma/prisma.service.js";\n',
    );
    writeFileSync(join(workdir, APP_DIR, "puro.ts"), "export const valor = 1;\n");
  });

  afterAll(() => {
    rmSync(workdir, { recursive: true, force: true });
  });

  async function violations(): Promise<{ from: string; rule: string }[]> {
    const result = await cruise(["apps"], {
      ...ruleSet.options,
      ruleSet,
      validate: true,
      baseDir: workdir,
    });
    if (typeof result.output === "string") throw new Error("saída inesperada");
    return result.output.summary.violations.map((v) => ({ from: v.from, rule: v.rule.name }));
  }

  it.each(["usa-nest", "usa-prisma", "usa-common"])(
    "reprova %s.ts na pasta application",
    async (arquivo) => {
      expect(await violations()).toContainEqual({
        from: `${APP_DIR}/${arquivo}.ts`,
        rule: "application-sem-framework",
      });
    },
  );

  it("aceita um arquivo puro na pasta application", async () => {
    expect((await violations()).map((v) => v.from)).not.toContain(`${APP_DIR}/puro.ts`);
  });
});
