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

  it("sem preço anterior (nulo ou ausente) não há desconto", () => {
    expect(calcularDesconto(null, 3200)).toBeNull();
    expect(calcularDesconto(undefined, 3200)).toBeNull();
  });

  it("desconto que arredonda para 0% não é desconto: R$ 32,01 para R$ 32,00 não mostra selo", () => {
    expect(calcularDesconto(3201, 3200)).toBeNull();
  });

  it("multiplica antes de dividir: R$ 40,00 para R$ 17,00 é exatamente 57,5% e arredonda para 58", () => {
    expect(calcularDesconto(4000, 1700)).toBe(58);
  });
});
