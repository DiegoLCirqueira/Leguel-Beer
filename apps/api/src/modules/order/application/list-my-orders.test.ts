import { PEDIDOS_POR_PAGINA } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import type { OrderListRow } from "../domain/order-reader.js";
import { InMemoryOrderReader } from "../testing/in-memory-order-reader.js";
import { ListMyOrders } from "./list-my-orders.js";

const ANA = "ana-id";
const NOW = new Date("2026-11-27T15:00:00.000Z");

function listRow(n: number, overrides: Partial<OrderListRow> = {}): OrderListRow {
  const createdAt = new Date(NOW.getTime() - n * 60_000);
  return {
    id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    number: `#LB${String(n).padStart(6, "0")}`,
    status: "pago",
    createdAt,
    itemCount: 2,
    beerNames: ["Maré Alta"],
    totalCents: 5_000,
    ...overrides,
  };
}

function readerWith(rows: OrderListRow[], ownerId = ANA): InMemoryOrderReader {
  const reader = new InMemoryOrderReader();
  for (const list of rows) {
    reader.add({ ownerId, list, expiresAt: new Date(list.createdAt.getTime() + 30 * 60_000) });
  }
  return reader;
}

function useCase(reader: InMemoryOrderReader): ListMyOrders {
  return new ListMyOrders(reader, { execute: async (id) => reader.expire(id) }, () => NOW);
}

describe("ListMyOrders", () => {
  it("traz 20 pedidos por página, do mais recente ao mais antigo, e a segunda página traz o que sobrou sem repetir", async () => {
    const rows = Array.from({ length: 21 }, (_, i) => listRow(i + 1));
    const list = useCase(readerWith([...rows].reverse()));

    const first = await list.execute({ ownerId: ANA, limit: PEDIDOS_POR_PAGINA });
    expect(first.pedidos.map((p) => p.numero)).toEqual(rows.slice(0, 20).map((r) => r.number));
    expect(first.proximoCursor).not.toBeNull();

    const second = await list.execute({
      ownerId: ANA,
      cursor: first.proximoCursor ?? undefined,
      limit: PEDIDOS_POR_PAGINA,
    });
    expect(second.pedidos.map((p) => p.numero)).toEqual([rows[20]?.number]);
    expect(second.proximoCursor).toBeNull();
  });

  it("um pedido aguardando pagamento com o Pix vencido volta como cancelado, sem esperar o cron", async () => {
    const waiting = listRow(1, {
      status: "aguardando-pagamento",
      createdAt: new Date(NOW.getTime() - 31 * 60_000),
    });
    const fresh = listRow(2, {
      status: "aguardando-pagamento",
      createdAt: new Date(NOW.getTime() - 5 * 60_000),
    });
    const reader = readerWith([waiting, fresh]);

    const result = await useCase(reader).execute({ ownerId: ANA, limit: PEDIDOS_POR_PAGINA });

    expect(Object.fromEntries(result.pedidos.map((p) => [p.numero, p.status]))).toEqual({
      [waiting.number]: "cancelado",
      [fresh.number]: "aguardando-pagamento",
    });
  });
});
