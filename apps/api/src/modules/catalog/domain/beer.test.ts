import { describe, expect, it } from "vitest";
import { makeBeer } from "../testing/beers.js";
import { availableQuantity, isSoldOut } from "./beer.js";

describe("quantidade disponível e esgotada", () => {
  it("sem reservas, a quantidade disponível é o estoque", () => {
    expect(availableQuantity(makeBeer({ stock: 12, reserved: 0 }))).toBe(12);
  });

  it("a quantidade disponível é o estoque físico menos as unidades reservadas", () => {
    expect(availableQuantity(makeBeer({ stock: 12, reserved: 5 }))).toBe(7);
  });

  it("nunca fica negativa, mesmo com mais reservas que estoque", () => {
    expect(availableQuantity(makeBeer({ stock: 2, reserved: 3 }))).toBe(0);
  });

  it("com tudo reservado a cerveja aparece esgotada", () => {
    expect(isSoldOut(makeBeer({ stock: 4, reserved: 4 }))).toBe(true);
  });

  it("esgotada é só a cerveja com quantidade disponível 0", () => {
    expect(isSoldOut(makeBeer({ stock: 0 }))).toBe(true);
    expect(isSoldOut(makeBeer({ stock: 1 }))).toBe(false);
  });
});
