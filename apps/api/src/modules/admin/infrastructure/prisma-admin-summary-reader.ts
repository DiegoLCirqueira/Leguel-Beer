import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { AdminSummary, AdminSummaryReader } from "../domain/admin-summary-reader.js";

export class PrismaAdminSummaryReader implements AdminSummaryReader {
  constructor(private readonly prisma: PrismaService) {}

  async read(at: Date): Promise<AdminSummary> {
    void this.prisma;
    void at;
    return { lowStockBeers: 0, paidOrdersAwaitingPreparation: 0 };
  }
}
