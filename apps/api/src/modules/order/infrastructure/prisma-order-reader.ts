import type {
  OrderCursor,
  OrderDetailRow,
  OrderListRow,
  OrderReader,
} from "../domain/order-reader.js";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import { STATUS_BY_ROW } from "./prisma-order-repository.js";

export class PrismaOrderReader implements OrderReader {
  constructor(private readonly prisma: PrismaService) {}

  async listOwned(
    ownerId: string,
    page: { after: OrderCursor | null; limit: number },
  ): Promise<OrderListRow[]> {
    const after = page.after;
    const rows = await this.prisma.order.findMany({
      where: {
        profileId: ownerId,
        ...(after
          ? {
              OR: [
                { createdAt: { lt: after.createdAt } },
                { createdAt: after.createdAt, id: { lt: after.id } },
              ],
            }
          : {}),
      },
      // O id desempata pedidos criados no mesmo instante: a ordem é total e estável.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: page.limit,
      select: {
        id: true,
        number: true,
        status: true,
        createdAt: true,
        totalCents: true,
        items: {
          select: { name: true, quantity: true },
          orderBy: [{ name: "asc" }, { id: "asc" }],
        },
      },
    });
    return rows.map((row) => ({
      id: row.id,
      number: row.number,
      status: STATUS_BY_ROW[row.status],
      createdAt: row.createdAt,
      itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
      beerNames: row.items.map((item) => item.name),
      totalCents: row.totalCents,
    }));
  }

  async findOwned(ownerId: string, orderId: string): Promise<OrderDetailRow | null> {
    // A posse vai no próprio filtro: pedido de outro cliente é igual a pedido que não existe.
    const row = await this.prisma.order.findFirst({
      where: { id: orderId, profileId: ownerId },
      include: {
        items: { orderBy: [{ name: "asc" }, { id: "asc" }] },
        statusHistory: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
      },
    });
    if (!row) return null;
    return {
      id: row.id,
      number: row.number,
      status: STATUS_BY_ROW[row.status],
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      payment:
        row.paymentMethod === "CARD"
          ? { tipo: "cartao", parcelas: row.installments ?? 1 }
          : { tipo: "pix" },
      items: row.items.map((item) => ({
        beerId: item.beerId,
        name: item.name,
        priceCents: item.unitPriceCents,
        quantity: item.quantity,
      })),
      subtotalCents: row.subtotalCents,
      shippingCents: row.shippingCents,
      totalCents: row.totalCents,
      shipTo: {
        zip: row.shipZip,
        street: row.shipStreet,
        number: row.shipNumber,
        complement: row.shipComplement,
        district: row.shipDistrict,
        city: row.shipCity,
        state: row.shipState,
      },
      // Só o status e a data: o motivo e quem mudou são internos.
      history: row.statusHistory.map((change) => ({
        status: STATUS_BY_ROW[change.toStatus],
        at: change.createdAt,
      })),
    };
  }

  async findDueOwnedIds(ownerId: string, at: Date): Promise<string[]> {
    const rows = await this.prisma.order.findMany({
      where: { profileId: ownerId, status: "AWAITING_PAYMENT", expiresAt: { lte: at } },
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }
}
