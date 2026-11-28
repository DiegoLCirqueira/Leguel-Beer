import type { StatusDoPedido } from "@leguele/shared";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { OrderStatus, Prisma } from "../../../generated/prisma/client.js";
import type { ExpirableOrder, OrderRepository } from "../domain/order-repository.js";

export const STATUS_BY_ROW: Record<OrderStatus, StatusDoPedido> = {
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
      // Quem já falhou vai para o fim: um pedido que sempre falha não trava o lote.
      orderBy: [{ expirationFailures: "asc" }, { expiresAt: "asc" }],
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
      await lockOrderOwner(tx, orderId);
      const change = { orderId, to: "CANCELLED" as const, reason, at };
      const left = await leaveAwaitingPayment(tx, { ...change, data: { cancelReason: reason } });
      if (!left) return false;

      await tx.stockReservation.updateMany({
        where: { orderId, releasedAt: null, consumedAt: null },
        data: { releasedAt: at },
      });
      await tx.fridgePendingDeduction.deleteMany({ where: { orderId } });
      // O histórico é o último passo: se ele falhar, nenhum efeito acima fica gravado.
      await recordTransition(tx, change);
      return true;
    });
  }

  async confirmPaymentIfAwaiting(orderId: string, actorId: string, at: Date): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      await lockOrderOwner(tx, orderId);
      const change = { orderId, to: "PAID" as const, actorId, at };
      // Dentro da validade: a expiração e a confirmação disputam a mesma linha.
      const left = await leaveAwaitingPayment(tx, { ...change, where: { expiresAt: { gt: at } } });
      if (!left) return false;

      await consumeReservations(tx, orderId, at);
      await applyFridgeDeductions(tx, orderId);
      // O histórico é o último passo: se ele falhar, nenhum efeito acima fica gravado.
      await recordTransition(tx, change);
      return true;
    });
  }

  async recordExpirationFailure(orderId: string): Promise<void> {
    await this.prisma.order.update({
      where: { id: orderId },
      data: { expirationFailures: { increment: 1 } },
    });
  }
}

type Tx = Prisma.TransactionClient;

/**
 * Trava a linha do perfil dono do pedido, a mesma que a gravação da Geladeira usa: confirmar,
 * cancelar e expirar passam uma de cada vez com ela, então a baixa não é desfeita no meio de uma
 * gravação. Ordem de travas fixa em todo o código: perfil primeiro, depois o pedido e suas linhas.
 */
async function lockOrderOwner(tx: Tx, orderId: string): Promise<void> {
  await tx.$queryRaw`
    SELECT p.id FROM profiles p JOIN orders o ON o.profile_id = p.id
    WHERE o.id = ${orderId}::uuid FOR UPDATE OF p`;
}

type Leaving = {
  orderId: string;
  to: OrderStatus;
  reason?: string;
  actorId?: string;
  at: Date;
};

/**
 * Tira o pedido de "aguardando pagamento". A condição no próprio UPDATE decide a corrida: só uma
 * chamada vê uma linha afetada e as demais recebem `false`.
 */
async function leaveAwaitingPayment(
  tx: Tx,
  change: Leaving & {
    where?: Prisma.OrderWhereInput;
    data?: Prisma.OrderUpdateManyMutationInput;
  },
): Promise<boolean> {
  const { count } = await tx.order.updateMany({
    where: { id: change.orderId, status: "AWAITING_PAYMENT", ...change.where },
    data: { status: change.to, ...change.data },
  });
  return count > 0;
}

/** Grava a transição no histórico do pedido; vai sempre por último na transação. */
async function recordTransition(tx: Tx, change: Leaving): Promise<void> {
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
