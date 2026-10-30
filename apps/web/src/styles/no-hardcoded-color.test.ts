// @vitest-environment node
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

async function lint(code: string) {
  const eslint = new ESLint({ cwd: process.cwd() });
  const [result] = await eslint.lintText(code, { filePath: "src/components/exemplo.tsx" });
  return result?.messages ?? [];
}

describe("regra de cor fixa", () => {
  it("barra cor hexadecimal escrita no componente e pede um token", async () => {
    const messages = await lint('export const cor = "#ff0000";\n');

    expect(messages.map((m) => m.message).join(" ")).toMatch(/token/);
  });

  it("barra cor rgb escrita no componente", async () => {
    const messages = await lint('export const cor = "rgb(255, 0, 0)";\n');

    expect(messages).not.toHaveLength(0);
  });

  it("aceita classes de token", async () => {
    const messages = await lint('export const cor = "bg-primaria text-texto";\n');

    expect(messages).toHaveLength(0);
  });
});
