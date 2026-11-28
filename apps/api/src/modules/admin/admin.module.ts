import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { STOCK_REPOSITORY } from "./admin.tokens.js";
import { GetAdminSummary } from "./application/get-admin-summary.js";
import type { StockRepository } from "./domain/stock.js";
import { PrismaAdminSummaryReader } from "./infrastructure/prisma-admin-summary-reader.js";
import { PrismaStockRepository } from "./infrastructure/prisma-stock-repository.js";
import { AdminStockController } from "./presentation/admin-stock.controller.js";
import { AdminSummaryController } from "./presentation/admin-summary.controller.js";

@Module({
  controllers: [AdminSummaryController, AdminStockController],
  providers: [
    {
      provide: STOCK_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaStockRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: GetAdminSummary,
      useFactory: (prisma: PrismaService, stock: StockRepository) =>
        new GetAdminSummary(new PrismaAdminSummaryReader(prisma, stock), () => new Date()),
      inject: [PrismaService, STOCK_REPOSITORY],
    },
  ],
})
export class AdminModule {}
