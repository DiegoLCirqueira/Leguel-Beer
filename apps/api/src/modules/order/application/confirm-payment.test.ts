import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { PaymentNotConfirmableError } from "../domain/order-errors.js";
import type { ExpirableOrder, OrderRepository } from "../domain/order-repository.js";
import { ConfirmPayment } from "./confirm-payment.js";

const CREATED_AT = new Date("2026-11-14T10:00:00.000Z");

function minutesAfter(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

class InMemoryOrderRepository implements OrderRepository {
  confirmations: { orderId: string; actorId: string; at: Date }[] = [];
  cancellations: { orderId: string; reason: string; at: Date }[] = [];

  constructor(private readonly orders: ExpirableOrder[]) {}

  async findDueOrderIds(): Promise<string[]> {
    return [];
  }

  async findForExpiration(orderId: string): Promise<ExpirableOrder | null> {
    return this.orders.find((order) => order.id === orderId) ?? null;
  }

  async cancelIfAwaitingPayment(orderId: string, reason: string, at: Date): Promise<boolean> {
    this.cancellations.push({ orderId, reason, at });
    return true;
  }

  async confirmPaymentIfAwaiting(orderId: string, actorId: string, at: Date): Promise<boolean> {
    const order = this.orders.find((candidate) => candidate.id === orderId);
    if (order?.status !== "aguardando-pagamento") return false;
    this.confirmations.push({ orderId, actorId, at });
    return true;
  }
}

function awaitingOrder(overrides: Partial<ExpirableOrder> = {}): ExpirableOrder {
  return {
    id: "order-1",
    status: "aguardando-pagamento",
    expiresAt: minutesAfter(CREATED_AT, 30),
    ...overrides,
  };
}

describe("ConfirmPayment", () => {
  it("confirma o pagamento do pedido aguardando, 10 minutos depois de criado, em nome do admin", async () => {
    const now = minutesAfter(CREATED_AT, 10);
    const orders = new InMemoryOrderRepository([awaitingOrder()]);
    const confirm = new ConfirmPayment(orders, () => now);

    await confirm.execute({ orderId: "order-1", actorId: "admin-1" });

    expect(orders.confirmations).toEqual([{ orderId: "order-1", actorId: "admin-1", at: now }]);
  });

  it("com a validade vencida há 1 minuto expira o pedido em vez de confirmar e responde conflito", async () => {
    const now = minutesAfter(CREATED_AT, 31);
    const orders = new InMemoryOrderRepository([awaitingOrder()]);
    const confirm = new ConfirmPayment(orders, () => now);

    await expect(
      confirm.execute({ orderId: "order-1", actorId: "admin-1" }),
    ).rejects.toBeInstanceOf(PaymentNotConfirmableError);

    expect(orders.confirmations).toEqual([]);
    expect(orders.cancellations).toEqual([
      { orderId: "order-1", reason: "pagamento não concluído", at: now },
    ]);
  });

  it("pedido inexistente responde não encontrado e não confirma nada", async () => {
    const orders = new InMemoryOrderRepository([]);
    const confirm = new ConfirmPayment(orders, () => CREATED_AT);

    await expect(
      confirm.execute({ orderId: "order-9", actorId: "admin-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);

    expect(orders.confirmations).toEqual([]);
  });

  it.each(["pago", "em-preparo", "cancelado"] as const)(
    "pedido já %s responde conflito e não confirma de novo",
    async (status) => {
      const orders = new InMemoryOrderRepository([awaitingOrder({ status })]);
      const confirm = new ConfirmPayment(orders, () => minutesAfter(CREATED_AT, 10));

      await expect(
        confirm.execute({ orderId: "order-1", actorId: "admin-1" }),
      ).rejects.toBeInstanceOf(PaymentNotConfirmableError);

      expect(orders.confirmations).toEqual([]);
    },
  );
});
