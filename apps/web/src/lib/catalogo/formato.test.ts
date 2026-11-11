import { describe, expect, it } from "vitest";
import { formatarTeor, IMAGEM_PADRAO } from "./formato";

describe("formatarTeor", () => {
  it("usa vírgula e uma casa decimal, mesmo para teor inteiro", () => {
    expect(formatarTeor(6.5)).toBe("6,5");
    expect(formatarTeor(5)).toBe("5,0");
    expect(formatarTeor(4.25)).toBe("4,3");
  });
});

describe("IMAGEM_PADRAO", () => {
  it("aponta para um arquivo da pasta public", () => {
    expect(IMAGEM_PADRAO).toMatch(/^\/.+\.webp$/);
  });
});
