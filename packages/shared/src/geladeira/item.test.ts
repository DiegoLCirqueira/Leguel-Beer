import { describe, expect, it } from "vitest";
import { itemDaGeladeiraSchema } from "./item.js";

const item = { cervejaId: "cerveja-1", quantidade: 2, precoVistoCentavos: 3200 };

describe("itemDaGeladeiraSchema", () => {
  it("aceita a cerveja, a quantidade e o preço que o cliente viu", () => {
    expect(itemDaGeladeiraSchema.parse(item)).toEqual(item);
  });

  it.each([0, 100, -1])("recusa a quantidade %i: vai de 1 a 99", (quantidade) => {
    expect(itemDaGeladeiraSchema.safeParse({ ...item, quantidade }).success).toBe(false);
  });

  it.each([-1, 10.5])("recusa o preço visto %s: é inteiro e não negativo", (precoVistoCentavos) => {
    expect(itemDaGeladeiraSchema.safeParse({ ...item, precoVistoCentavos }).success).toBe(false);
  });

  it("aceita o preço visto 0", () => {
    expect(itemDaGeladeiraSchema.safeParse({ ...item, precoVistoCentavos: 0 }).success).toBe(true);
  });

  it.each([1, 99])("aceita a quantidade %i, nos extremos do limite", (quantidade) => {
    expect(itemDaGeladeiraSchema.safeParse({ ...item, quantidade }).success).toBe(true);
  });
});
