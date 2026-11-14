import type { StatusDoPedido } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { OrderStatus } from "../../../generated/prisma/client.js";
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
      // A condição no próprio UPDATE decide a corrida: só uma chamada vê uma linha afetada.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, status: "AWAITING_PAYMENT" },
        data: { status: "CANCELLED", cancelReason: reason },
      });
      if (count === 0) return false;

      await tx.stockReservation.updateMany({
        where: { orderId, releasedAt: null, consumedAt: null },
        data: { releasedAt: at },
      });
      await tx.fridgePendingDeduction.deleteMany({ where: { orderId } });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: "AWAITING_PAYMENT",
          toStatus: "CANCELLED",
          reason,
          createdAt: at,
        },
      });
      return true;
    });
  }
}
