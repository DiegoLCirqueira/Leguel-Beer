import type {
  OrderCursor,
  OrderDetailRow,
  OrderListRow,
  OrderReader,
} from "../domain/order-reader.js";

export interface StoredOrder {
  ownerId: string;
  list: OrderListRow;
  detail?: OrderDetailRow;
  /** Para a checagem de expiração sob demanda. */
  expiresAt: Date;
}

function isBefore(row: OrderListRow, cursor: OrderCursor): boolean {
  const time = row.createdAt.getTime();
  const limit = cursor.createdAt.getTime();
  return time < limit || (time === limit && row.id < cursor.id);
}

/** Leitor em memória: mesma ordem e mesma posse que o banco (recente primeiro, id desempata). */
export class InMemoryOrderReader implements OrderReader {
  readonly orders: StoredOrder[] = [];
  /** Cada pedido que o leitor viu como vencido e entregou à expiração. */
  expired: string[] = [];

  add(order: StoredOrder): void {
    this.orders.push(order);
  }

  async listOwned(
    ownerId: string,
    page: { after: OrderCursor | null; limit: number },
  ): Promise<OrderListRow[]> {
    return this.orders
      .filter((order) => order.ownerId === ownerId)
      .map((order) => order.list)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime() || (a.id < b.id ? 1 : -1))
      .filter((row) => page.after === null || isBefore(row, page.after))
      .slice(0, page.limit);
  }

  async findOwned(ownerId: string, orderId: string): Promise<OrderDetailRow | null> {
    const order = this.orders.find((o) => o.ownerId === ownerId && o.list.id === orderId);
    return order?.detail ?? null;
  }

  async findDueOwnedIds(ownerId: string, at: Date, limit: number): Promise<string[]> {
    return this.orders
      .filter(
        (o) =>
          o.ownerId === ownerId &&
          o.list.status === "aguardando-pagamento" &&
          o.expiresAt.getTime() <= at.getTime(),
      )
      .map((o) => o.list.id)
      .slice(0, limit);
  }

  /** O que a expiração faz no banco: o pedido vencido passa a cancelado. */
  expire(orderId: string): void {
    const order = this.orders.find((o) => o.list.id === orderId);
    if (!order) return;
    order.list = { ...order.list, status: "cancelado" };
    if (order.detail) order.detail = { ...order.detail, status: "cancelado" };
    this.expired.push(orderId);
  }
}
