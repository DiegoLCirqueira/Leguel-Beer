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
    void ownerId;
    void orderId;
    return null;
  }

  async findDueOwnedIds(ownerId: string, at: Date): Promise<string[]> {
    void ownerId;
    void at;
    return [];
  }
}
