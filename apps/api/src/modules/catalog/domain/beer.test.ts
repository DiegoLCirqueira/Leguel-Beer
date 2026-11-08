import { describe, expect, it } from "vitest";
import { makeBeer } from "../testing/beers.js";
import { availableQuantity, isSoldOut } from "./beer.js";

describe("quantidade disponível e esgotada", () => {
  it("a quantidade disponível é o estoque (as reservas entram com o LB-56)", () => {
    expect(availableQuantity(makeBeer({ stock: 12 }))).toBe(12);
  });

  it("esgotada é só a cerveja com quantidade disponível 0", () => {
    expect(isSoldOut(makeBeer({ stock: 0 }))).toBe(true);
    expect(isSoldOut(makeBeer({ stock: 1 }))).toBe(false);
  });
});
