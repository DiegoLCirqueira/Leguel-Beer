import { describe, expect, it } from "vitest";
import { listaDePedidosSchema, pedidoDaListaSchema } from "./lista.js";

const pedido = {
  id: "8d1b5f0e-6a73-4c1d-9a2e-3f6d7c8b9a10",
  numero: "#LB482731",
  status: "aguardando-pagamento",
  criadoEm: "2026-11-13T00:42:00.000Z",
  quantidadeDeItens: 3,
  cervejas: ["Maré Alta", "Ponta Verde"],
  totalCentavos: 16_200,
};

describe("pedido da lista", () => {
  it("aceita o pedido com número, status, itens, cervejas e total, e recusa quantidade zero", () => {
    expect(pedidoDaListaSchema.parse(pedido)).toEqual(pedido);
    expect(pedidoDaListaSchema.safeParse({ ...pedido, quantidadeDeItens: 0 }).success).toBe(false);
  });
});

describe("lista de pedidos", () => {
  it("traz os pedidos e o cursor da próxima página, nulo na última", () => {
    expect(listaDePedidosSchema.parse({ pedidos: [pedido], proximoCursor: "abc" })).toEqual({
      pedidos: [pedido],
      proximoCursor: "abc",
    });
    expect(listaDePedidosSchema.parse({ pedidos: [], proximoCursor: null })).toEqual({
      pedidos: [],
      proximoCursor: null,
    });
    expect(listaDePedidosSchema.safeParse({ pedidos: [pedido] }).success).toBe(false);
  });
});
