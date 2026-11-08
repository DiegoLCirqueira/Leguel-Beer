import { describe, expect, it } from "vitest";
import { calcularDesconto } from "./desconto.js";

describe("calcularDesconto", () => {
  it("R$ 36,90 para R$ 32,00 é 13%", () => {
    expect(calcularDesconto(3690, 3200)).toBe(13);
  });

  it("arredonda ao inteiro mais próximo, não para baixo: R$ 10,00 para R$ 8,35 é 17%", () => {
    expect(calcularDesconto(1000, 835)).toBe(17);
    expect(calcularDesconto(1000, 836)).toBe(16);
  });

  it("preço anterior igual ou menor que o atual não é desconto", () => {
    expect(calcularDesconto(3200, 3200)).toBeNull();
    expect(calcularDesconto(2900, 3200)).toBeNull();
  });
});
