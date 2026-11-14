import { describe, expect, it } from "vitest";
import type { ExpirableOrder, OrderRepository } from "../domain/order-repository.js";
import { PaymentGatewayUnavailableError, type PaymentGateway } from "../domain/payment-gateway.js";
import { ExpireOrder } from "./expire-order.js";

const CREATED_AT = new Date("2026-11-14T10:00:00.000Z");

function minutesAfter(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

class InMemoryOrderRepository implements OrderRepository {
  cancellations: { orderId: string; reason: string; at: Date }[] = [];

  constructor(private readonly orders: ExpirableOrder[]) {}

  async findForExpiration(orderId: string): Promise<ExpirableOrder | null> {
    return this.orders.find((order) => order.id === orderId) ?? null;
  }

  async cancelIfAwaitingPayment(orderId: string, reason: string, at: Date): Promise<boolean> {
    const order = this.orders.find((candidate) => candidate.id === orderId);
    if (!order || order.status !== "aguardando-pagamento") return false;
    order.status = "cancelado";
    this.cancellations.push({ orderId, reason, at });
    return true;
  }
}

class FakePaymentGateway implements PaymentGateway {
  constructor(private readonly outcome: "not-approved" | "unavailable" = "not-approved") {}

  async findApprovedPayment(): Promise<{ approvedAt: Date } | null> {
    if (this.outcome === "unavailable") throw new PaymentGatewayUnavailableError();
    return null;
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

describe("ExpireOrder", () => {
  it("cancela o pedido aguardando pagamento vencido há 31 minutos com o motivo 'pagamento não concluído'", async () => {
    const now = minutesAfter(CREATED_AT, 31);
    const orders = new InMemoryOrderRepository([awaitingOrder()]);
    const expire = new ExpireOrder(orders, new FakePaymentGateway(), () => now);

    await expire.execute("order-1");

    expect(orders.cancellations).toEqual([
      { orderId: "order-1", reason: "pagamento não concluído", at: now },
    ]);
  });

  it("não muda o pedido ainda dentro da validade, 10 minutos depois de criado", async () => {
    const orders = new InMemoryOrderRepository([awaitingOrder()]);
    const expire = new ExpireOrder(orders, new FakePaymentGateway(), () =>
      minutesAfter(CREATED_AT, 10),
    );

    await expire.execute("order-1");

    expect(orders.cancellations).toEqual([]);
  });

  it("não cancela o pedido vencido se o gateway não responde, para tentar de novo na próxima checagem", async () => {
    const orders = new InMemoryOrderRepository([awaitingOrder()]);
    const expire = new ExpireOrder(orders, new FakePaymentGateway("unavailable"), () =>
      minutesAfter(CREATED_AT, 31),
    );

    await expire.execute("order-1");

    expect(orders.cancellations).toEqual([]);
  });
});
