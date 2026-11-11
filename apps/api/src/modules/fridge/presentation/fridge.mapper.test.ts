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

  it("traduz os três tipos de ajuste para o contrato, mantendo a ordem", () => {
    const response = toGeladeiraResponse({
      items: [],
      adjustments: [
        {
          type: "price-changed",
          beerId: "a",
          name: "Maré Alta",
          seenPriceCents: 3200,
          currentPriceCents: 3000,
        },
        { type: "unavailable", beerId: "b", name: null },
        {
          type: "quantity-reduced",
          beerId: "c",
          name: "Cupuaçu Ale",
          previousQuantity: 3,
          currentQuantity: 1,
        },
      ],
    });

    expect(geladeiraResponseSchema.parse(response).ajustes).toEqual([
      {
        tipo: "preco-mudou",
        cervejaId: "a",
        nome: "Maré Alta",
        precoVistoCentavos: 3200,
        precoAtualCentavos: 3000,
      },
      { tipo: "indisponivel", cervejaId: "b", nome: null },
      {
        tipo: "quantidade-reduzida",
        cervejaId: "c",
        nome: "Cupuaçu Ale",
        quantidadeAnterior: 3,
        quantidadeAtual: 1,
      },
    ]);
  });
});
