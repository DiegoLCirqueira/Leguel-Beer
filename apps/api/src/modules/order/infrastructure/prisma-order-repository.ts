import type { StatusDoPedido } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { OrderStatus, Prisma } from "../../../generated/prisma/client.js";
import type { ExpirableOrder, OrderRepository } from "../domain/order-repository.js";

const STATUS_BY_ROW: Record<OrderStatus, StatusDoPedido> = {
  AWAITING_PAYMENT: "aguardando-pagamento",
  PAID: "pago",
  PREPARING: "em-preparo",
  OUT_FOR_DELIVERY: "saiu-para-entrega",
  DELIVERED: "entregue",
  CANCELLED: "cancelado",
};

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findDueOrderIds(at: Date, limit: number): Promise<string[]> {
    const rows = await this.prisma.order.findMany({
      where: { status: "AWAITING_PAYMENT", expiresAt: { lte: at } },
      select: { id: true },
      orderBy: { expiresAt: "asc" },
      take: limit,
    });
    return rows.map((row) => row.id);
  }

  async findForExpiration(orderId: string): Promise<ExpirableOrder | null> {
    const row = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, expiresAt: true },
    });
    if (!row) return null;
    return { id: row.id, status: STATUS_BY_ROW[row.status], expiresAt: row.expiresAt };
  }

  async cancelIfAwaitingPayment(orderId: string, reason: string, at: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const left = await leaveAwaitingPayment(tx, {
        orderId,
        to: "CANCELLED",
        data: { cancelReason: reason },
        reason,
        at,
      });
      if (!left) return false;

      await tx.stockReservation.updateMany({
        where: { orderId, releasedAt: null, consumedAt: null },
        data: { releasedAt: at },
      });
      await tx.fridgePendingDeduction.deleteMany({ where: { orderId } });
      return true;
    });
  }

  async confirmPaymentIfAwaiting(orderId: string, actorId: string, at: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const left = await leaveAwaitingPayment(tx, {
        orderId,
        to: "PAID",
        // Dentro da validade: a expiração e a confirmação disputam a mesma linha.
        where: { expiresAt: { gt: at } },
        actorId,
        at,
      });
      if (!left) return false;

      await consumeReservations(tx, orderId, at);
      await applyFridgeDeductions(tx, orderId);
      return true;
    });
  }
}

type Tx = Prisma.TransactionClient;

/**
 * Tira o pedido de "aguardando pagamento" e grava o histórico, na mesma transação. A condição no
 * próprio UPDATE decide a corrida: só uma chamada vê uma linha afetada e as demais recebem `false`.
 */
async function leaveAwaitingPayment(
  tx: Tx,
  change: {
    orderId: string;
    to: OrderStatus;
    where?: Prisma.OrderWhereInput;
    data?: Prisma.OrderUpdateManyMutationInput;
    reason?: string;
    actorId?: string;
    at: Date;
  },
): Promise<boolean> {
  const { count } = await tx.order.updateMany({
    where: { id: change.orderId, status: "AWAITING_PAYMENT", ...change.where },
    data: { status: change.to, ...change.data },
  });
  if (count === 0) return false;

  await tx.orderStatusHistory.create({
    data: {
      orderId: change.orderId,
      fromStatus: "AWAITING_PAYMENT",
      toStatus: change.to,
      reason: change.reason,
      actorId: change.actorId,
      createdAt: change.at,
    },
  });
  return true;
}

/** A reserva do pedido vira baixa no estoque físico, numa única instrução. */
async function consumeReservations(tx: Tx, orderId: string, at: Date): Promise<void> {
  await tx.$executeRaw`
    UPDATE beers b
    SET stock = b.stock - r.quantity
    FROM stock_reservations r
    WHERE r.order_id = ${orderId}::uuid AND r.beer_id = b.id
      AND r.released_at IS NULL AND r.consumed_at IS NULL`;
  await tx.stockReservation.updateMany({
    where: { orderId, releasedAt: null, consumedAt: null },
    data: { consumedAt: at },
  });
}

/**
 * Tira da Geladeira da conta as unidades do pedido que ainda estão lá, sem deixar a quantidade
 * negativa: o que zera sai da Geladeira (a quantidade na Geladeira é sempre positiva). Duas
 * instruções, sem uma consulta por cerveja.
 */
async function applyFridgeDeductions(tx: Tx, orderId: string): Promise<void> {
  await tx.$executeRaw`
    DELETE FROM fridge_items fi
    USING fridge_pending_deductions d, fridges f, orders o
    WHERE d.order_id = ${orderId}::uuid AND o.id = d.order_id
      AND f.profile_id = o.profile_id AND fi.fridge_id = f.id AND fi.beer_id = d.beer_id
      AND fi.quantity <= d.quantity`;
  await tx.$executeRaw`
    UPDATE fridge_items fi
    SET quantity = fi.quantity - d.quantity
    FROM fridge_pending_deductions d, fridges f, orders o
    WHERE d.order_id = ${orderId}::uuid AND o.id = d.order_id
      AND f.profile_id = o.profile_id AND fi.fridge_id = f.id AND fi.beer_id = d.beer_id`;
  await tx.fridgePendingDeduction.deleteMany({ where: { orderId } });
}
