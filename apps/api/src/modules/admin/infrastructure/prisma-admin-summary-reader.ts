import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { AdminSummary, AdminSummaryReader } from "../domain/admin-summary-reader.js";
import type { StockRepository } from "../domain/stock.js";

export class PrismaAdminSummaryReader implements AdminSummaryReader {
  constructor(
    private readonly prisma: PrismaService,
    /** A mesma consulta e a mesma regra do selo Baixo da tela de Estoque. */
    private readonly stock: StockRepository,
  ) {}

  async read(at: Date): Promise<AdminSummary> {
    const items = await this.stock.list(at);
    const paid = await this.prisma.order.count({ where: { status: "PAID" } });
    return {
      lowStockBeers: items.filter((item) => item.low).length,
      paidOrdersAwaitingPreparation: paid,
    };
  }
}
