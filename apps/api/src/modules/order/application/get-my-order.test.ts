import { pedidoDoClienteSchema } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import type { OrderDetailRow } from "../domain/order-reader.js";
import { InMemoryOrderReader } from "../testing/in-memory-order-reader.js";
import { GetMyOrder } from "./get-my-order.js";

const ANA = "ana-id";
const NOW = new Date("2026-11-27T15:00:00.000Z");
const CREATED_AT = new Date("2026-11-27T14:50:00.000Z");
const ORDER_ID = "00000000-0000-4000-8000-000000000001";

function detail(overrides: Partial<OrderDetailRow> = {}): OrderDetailRow {
  return {
    id: ORDER_ID,
    number: "#LB482731",
    status: "em-preparo",
    createdAt: CREATED_AT,
    expiresAt: new Date(CREATED_AT.getTime() + 30 * 60_000),
    payment: { tipo: "pix" },
    items: [{ beerId: "b1", name: "Maré Alta", priceCents: 2_000, quantity: 2 }],
    subtotalCents: 4_000,
    shippingCents: 1_290,
    totalCents: 5_290,
    shipTo: {
      zip: "57035000",
      street: "Rua do Sol",
      number: "100",
      complement: null,
      district: "Farol",
      city: "Maceió",
      state: "AL",
    },
    history: [
      { status: "aguardando-pagamento", at: CREATED_AT },
      { status: "pago", at: new Date("2026-11-27T14:52:00.000Z") },
      { status: "em-preparo", at: new Date("2026-11-27T14:55:00.000Z") },
    ],
    ...overrides,
  };
}

function readerWith(order: OrderDetailRow, ownerId = ANA): InMemoryOrderReader {
  const reader = new InMemoryOrderReader();
  reader.add({
    ownerId,
    expiresAt: order.expiresAt,
    detail: order,
    list: {
      id: order.id,
      number: order.number,
      status: order.status,
      createdAt: order.createdAt,
      itemCount: 2,
      beerNames: order.items.map((i) => i.name),
      totalCents: order.totalCents,
    },
  });
  return reader;
}

function useCase(reader: InMemoryOrderReader): GetMyOrder {
  return new GetMyOrder(reader, { execute: async (id) => reader.expire(id) }, () => NOW);
}

describe("GetMyOrder", () => {
  it("devolve o pedido com itens, valores, endereço de entrega e o histórico de status com data", async () => {
    const order = await useCase(readerWith(detail())).execute({ ownerId: ANA, orderId: ORDER_ID });

    expect(pedidoDoClienteSchema.parse(order)).toEqual({
      id: ORDER_ID,
      numero: "#LB482731",
      status: "em-preparo",
      criadoEm: "2026-11-27T14:50:00.000Z",
      validoAte: "2026-11-27T15:20:00.000Z",
      pagamento: { tipo: "pix" },
      itens: [{ cervejaId: "b1", nome: "Maré Alta", precoCentavos: 2_000, quantidade: 2 }],
      subtotalCentavos: 4_000,
      freteCentavos: 1_290,
      totalCentavos: 5_290,
      enderecoDeEntrega: {
        cep: "57035000",
        rua: "Rua do Sol",
        numero: "100",
        bairro: "Farol",
        cidade: "Maceió",
        uf: "AL",
      },
      historico: [
        { status: "aguardando-pagamento", em: "2026-11-27T14:50:00.000Z" },
        { status: "pago", em: "2026-11-27T14:52:00.000Z" },
        { status: "em-preparo", em: "2026-11-27T14:55:00.000Z" },
      ],
    });
  });
});
