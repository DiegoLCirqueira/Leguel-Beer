import type {
  OrderCursor,
  OrderDetailRow,
  OrderListRow,
  OrderReader,
} from "../domain/order-reader.js";
import type { PrismaService } from "../../../common/prisma/prisma.service.js";

export class PrismaOrderReader implements OrderReader {
  constructor(private readonly prisma: PrismaService) {}

  async listOwned(
    ownerId: string,
    page: { after: OrderCursor | null; limit: number },
  ): Promise<OrderListRow[]> {
    void this.prisma;
    void ownerId;
    void page;
    return [];
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
