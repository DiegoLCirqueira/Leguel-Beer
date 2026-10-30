// @vitest-environment node
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { compile } from "tailwindcss";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);

async function build(candidates: string[]): Promise<string> {
  const base = resolve(process.cwd(), "src/app");
  const compiler = await compile(readFileSync(resolve(base, "globals.css"), "utf8"), {
    base,
    loadStylesheet: async (id, from) => {
      const path = id === "tailwindcss" ? require.resolve("tailwindcss/index.css") : resolve(from, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  return compiler.build(candidates);
}

describe("paleta do Tailwind", () => {
  it("não compila cores padrão fora dos tokens", async () => {
    const css = await build(["bg-red-500", "text-white", "bg-primaria"]);

    expect(css).toContain(".bg-primaria");
    expect(css).not.toContain(".bg-red-500");
    expect(css).not.toContain(".text-white");
  });
});
