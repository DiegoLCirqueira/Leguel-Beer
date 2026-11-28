import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { AdminSummary, AdminSummaryReader } from "../domain/admin-summary-reader.js";

export class PrismaAdminSummaryReader implements AdminSummaryReader {
  constructor(private readonly prisma: PrismaService) {}

  async read(at: Date): Promise<AdminSummary> {
    // Disponível = físico menos as reservas válidas (não liberadas, não consumidas, dentro da validade).
    const [low] = await this.prisma.$queryRaw<{ total: number }[]>`
      SELECT count(*)::int AS total
      FROM beers b
      WHERE b.active
        AND b.stock - COALESCE((
          SELECT SUM(r.quantity) FROM stock_reservations r
          WHERE r.beer_id = b.id AND r.released_at IS NULL AND r.consumed_at IS NULL
            AND r.expires_at > ${at}
        ), 0) <= b.min_stock`;
    const paid = await this.prisma.order.count({ where: { status: "PAID" } });
    return { lowStockBeers: low?.total ?? 0, paidOrdersAwaitingPreparation: paid };
  }
}
