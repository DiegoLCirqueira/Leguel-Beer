import { describe, expect, it } from "vitest";
import { calcularDesconto } from "./desconto.js";

describe("calcularDesconto", () => {
  it("R$ 36,90 para R$ 32,00 é 13%", () => {
    expect(calcularDesconto(3690, 3200)).toBe(13);
  });
});
