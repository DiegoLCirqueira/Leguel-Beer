import { geladeiraResponseSchema } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { makeBeer } from "../../catalog/testing/beers.js";
import { toGeladeiraResponse } from "./fridge.mapper.js";

describe("toGeladeiraResponse", () => {
  it("monta a resposta do contrato com os itens, o total da linha e os totais conferidos", () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3200, stock: 10 });
    const cupuacu = makeBeer({ name: "Cupuaçu Ale", priceCents: 2650, stock: 3 });

    const response = toGeladeiraResponse({
      items: [
        { beer: mareAlta, quantity: 2 },
        { beer: cupuacu, quantity: 1 },
      ],
      adjustments: [],
    });

    expect(geladeiraResponseSchema.parse(response)).toEqual(response);
    expect(response.itens.map((item) => [item.cerveja.nome, item.quantidade, item.totalCentavos]))
      .toEqual([
        ["Maré Alta", 2, 6400],
        ["Cupuaçu Ale", 1, 2650],
      ]);
    expect(response.quantidadeTotal).toBe(3);
    expect(response.subtotalCentavos).toBe(9050);
  });
});
