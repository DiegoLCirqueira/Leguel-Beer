import { describe, expect, it } from "vitest";
import { ITENS_MAXIMOS_NA_GELADEIRA, QUANTIDADE_MAXIMA_POR_ITEM } from "./limites.js";

describe("limites da Geladeira", () => {
  it("limita a 99 unidades por cerveja e a 50 cervejas diferentes", () => {
    expect(QUANTIDADE_MAXIMA_POR_ITEM).toBe(99);
    expect(ITENS_MAXIMOS_NA_GELADEIRA).toBe(50);
  });
});
