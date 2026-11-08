import { describe, expect, it } from "vitest";
import { estoqueBaixo, LIMIAR_ESTOQUE_BAIXO } from "./estoque.js";

describe("estoqueBaixo", () => {
  it("o limiar é 5 e vale de 1 até 5 unidades; 6 já não é estoque baixo", () => {
    expect(LIMIAR_ESTOQUE_BAIXO).toBe(5);
    expect(estoqueBaixo(1)).toBe(true);
    expect(estoqueBaixo(3)).toBe(true);
    expect(estoqueBaixo(5)).toBe(true);
    expect(estoqueBaixo(6)).toBe(false);
  });
});
