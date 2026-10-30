import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

function token(name: string): string {
  const match = css.match(new RegExp(`--color-${name}: *([^;]+);`));
  if (!match?.[1]) throw new Error(`token ${name} não definido`);
  const value = match[1].trim();
  const alias = value.match(/^var\(--color-([\w-]+)\)$/);
  return alias?.[1] ? token(alias[1]) : value;
}

describe("contrastRatio", () => {
  it("dá 21 entre preto e branco", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });
});

describe("pares de tokens", () => {
  it.each([
    ["texto", "fundo"],
    ["texto", "superficie"],
    ["texto-suave", "superficie"],
    ["primaria", "fundo"],
    ["texto-na-primaria", "primaria"],
    ["texto-badge", "badge-ipa"],
    ["texto-badge", "badge-malt"],
    ["texto-badge", "badge-lager"],
    ["texto-na-primaria", "badge-frutas"],
    ["sucesso", "fundo"],
    ["sucesso", "superficie"],
    ["erro", "fundo"],
    ["erro", "superficie"],
    ["aviso", "fundo"],
    ["aviso", "superficie"],
  ])("%s sobre %s atinge contraste AA (4,5:1)", (texto, fundo) => {
    expect(contrastRatio(token(texto), token(fundo))).toBeGreaterThanOrEqual(4.5);
  });
});
