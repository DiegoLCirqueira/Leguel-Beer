import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { loadApiEnv } from "./load-env.js";

describe("loadApiEnv", () => {
  const dir = mkdtempSync(join(tmpdir(), "leguele-env-"));
  const file = join(dir, ".env");
  writeFileSync(file, "DATABASE_URL=do-arquivo\nTEST_DATABASE_URL=teste-do-arquivo\n");

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it("completa o ambiente com o .env sem sobrescrever o que já está definido", () => {
    const env: Record<string, string | undefined> = { DATABASE_URL: "do-ambiente" };

    loadApiEnv(file, env);

    expect(env).toEqual({
      DATABASE_URL: "do-ambiente",
      TEST_DATABASE_URL: "teste-do-arquivo",
    });
  });

  it("segue sem erro quando o .env não existe (CI)", () => {
    const env: Record<string, string | undefined> = {};

    expect(() => loadApiEnv(join(dir, "nao-existe.env"), env)).not.toThrow();
    expect(env).toEqual({});
  });
});
