import { describe, expect, it } from "vitest";
import {
  consultaDaListaDePedidosSchema,
  listaDePedidosSchema,
  PEDIDOS_POR_PAGINA,
  pedidoDaListaSchema,
} from "./lista.js";

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

describe("consulta da lista de pedidos", () => {
  it("vale 20 pedidos por página e o limite pedido nunca passa disso", () => {
    expect(PEDIDOS_POR_PAGINA).toBe(20);
    expect(consultaDaListaDePedidosSchema.parse({})).toEqual({ limite: 20 });
    expect(consultaDaListaDePedidosSchema.parse({ limite: "5" })).toEqual({ limite: 5 });
    for (const limite of ["0", "21", "-1", "1.5", "abc"]) {
      expect(consultaDaListaDePedidosSchema.safeParse({ limite }).success).toBe(false);
    }
  });

  it("aceita um cursor de até 200 caracteres e recusa vazio ou maior", () => {
    expect(consultaDaListaDePedidosSchema.parse({ cursor: "abc" })).toEqual({
      cursor: "abc",
      limite: 20,
    });
    expect(consultaDaListaDePedidosSchema.safeParse({ cursor: "" }).success).toBe(false);
    expect(consultaDaListaDePedidosSchema.safeParse({ cursor: "a".repeat(201) }).success).toBe(
      false,
    );
    expect(consultaDaListaDePedidosSchema.safeParse({ cursor: "a".repeat(200) }).success).toBe(
      true,
    );
  });

  it("o cursor devolvido na página também respeita os 200 caracteres", () => {
    expect(
      listaDePedidosSchema.safeParse({ pedidos: [], proximoCursor: "a".repeat(201) }).success,
    ).toBe(false);
  });
});
