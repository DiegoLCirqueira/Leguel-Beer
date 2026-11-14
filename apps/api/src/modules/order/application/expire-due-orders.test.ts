import { describe, expect, it } from "vitest";
import type { OrderRepository } from "../domain/order-repository.js";
import { ExpireDueOrders } from "./expire-due-orders.js";

const NOW = new Date("2026-11-14T10:31:00.000Z");

function repositoryWithDueOrders(dueIds: string[]): OrderRepository & { askedAt: Date[] } {
  const askedAt: Date[] = [];
  return {
    askedAt,
    async findDueOrderIds(at: Date) {
      askedAt.push(at);
      return dueIds;
    },
    async findForExpiration() {
      return null;
    },
    async cancelIfAwaitingPayment() {
      return false;
    },
  };
}

describe("ExpireDueOrders", () => {
  it("expira cada pedido aguardando pagamento vencido no instante do relógio", async () => {
    const orders = repositoryWithDueOrders(["order-1", "order-2"]);
    const expired: string[] = [];
    const expire = new ExpireDueOrders(
      orders,
      { execute: async (orderId: string) => void expired.push(orderId) },
      () => NOW,
    );

    await expire.execute();

    expect(orders.askedAt).toEqual([NOW]);
    expect(expired).toEqual(["order-1", "order-2"]);
  });
});
