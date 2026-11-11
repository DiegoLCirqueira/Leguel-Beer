import { describe, expect, it } from "vitest";
import { itemDaGeladeiraSchema } from "./item.js";

const item = { cervejaId: "cerveja-1", quantidade: 2, precoVistoCentavos: 3200 };

describe("itemDaGeladeiraSchema", () => {
  it("aceita a cerveja, a quantidade e o preço que o cliente viu", () => {
    expect(itemDaGeladeiraSchema.parse(item)).toEqual(item);
  });
});
