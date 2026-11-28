import { describe, expect, it } from "vitest";
import { gerarSlug } from "./slug.js";

describe("gerarSlug", () => {
  it("tira acento, põe em minúsculo e liga as palavras com hífen", () => {
    expect(gerarSlug("Maré Alta IPA!", [])).toBe("mare-alta-ipa");
    expect(gerarSlug("  Cupuaçu   Ale ", [])).toBe("cupuacu-ale");
  });

  it("se o slug já existe, ganha -2, -3...", () => {
    expect(gerarSlug("Maré Alta", ["mare-alta"])).toBe("mare-alta-2");
    expect(gerarSlug("Maré Alta", ["mare-alta", "mare-alta-2"])).toBe("mare-alta-3");
  });

  it("o slug reservado 'destaques' também ganha sufixo", () => {
    expect(gerarSlug("Destaques", [])).toBe("destaques-2");
  });

  it("nome sem letra nem número usa 'cerveja' e segue a regra do sufixo", () => {
    expect(gerarSlug("???", [])).toBe("cerveja");
    expect(gerarSlug("???", ["cerveja"])).toBe("cerveja-2");
  });
});
