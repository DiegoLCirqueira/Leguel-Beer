import { PEDIDOS_POR_PAGINA } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { ValidationError } from "../../../common/errors/validation-error.js";
import { encodeOrderCursor } from "../domain/order-cursor.js";
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

const reported: { orderId: string; error: unknown }[] = [];

function useCase(
  reader: InMemoryOrderReader,
  expire: (id: string) => Promise<void> = async (id) => reader.expire(id),
): ListMyOrders {
  return new ListMyOrders(
    reader,
    { execute: expire },
    () => NOW,
    (failure) => reported.push(failure),
  );
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

  it.each([
    "não-é-cursor",
    Buffer.from("2026-11-27|x").toString("base64url"),
    Buffer.from("lixo|00000000-0000-4000-8000-000000000001").toString("base64url"),
  ])("recusa o cursor inventado %s como dado inválido", async (cursor) => {
    const list = useCase(readerWith([listRow(1)]));

    await expect(
      list.execute({ ownerId: ANA, cursor, limit: PEDIDOS_POR_PAGINA }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("um pedido que falha ao expirar não derruba a lista: a falha é reportada por pedido e os outros seguem", async () => {
    reported.length = 0;
    const poison = listRow(1, {
      status: "aguardando-pagamento",
      createdAt: new Date(NOW.getTime() - 40 * 60_000),
    });
    const other = listRow(2, {
      status: "aguardando-pagamento",
      createdAt: new Date(NOW.getTime() - 35 * 60_000),
    });
    const reader = readerWith([poison, other]);
    const boom = new Error("dado do cliente");
    const list = useCase(reader, async (id) => {
      if (id === poison.id) throw boom;
      reader.expire(id);
    });

    const result = await list.execute({ ownerId: ANA, limit: PEDIDOS_POR_PAGINA });

    expect(Object.fromEntries(result.pedidos.map((p) => [p.numero, p.status]))).toEqual({
      [poison.number]: "aguardando-pagamento",
      [other.number]: "cancelado",
    });
    expect(reported).toEqual([{ orderId: poison.id, error: boom }]);
  });

  it("só a primeira página expira pedidos: com cursor, nada é expirado", async () => {
    const calls: string[] = [];
    const stale = listRow(1, {
      status: "aguardando-pagamento",
      createdAt: new Date(NOW.getTime() - 40 * 60_000),
    });
    const reader = readerWith([stale]);
    const cursor = encodeOrderCursor({
      createdAt: NOW,
      id: "00000000-0000-4000-8000-0000000000ff",
    });

    await useCase(reader, async (id) => void calls.push(id)).execute({
      ownerId: ANA,
      cursor,
      limit: PEDIDOS_POR_PAGINA,
    });

    expect(calls).toEqual([]);
  });
});
