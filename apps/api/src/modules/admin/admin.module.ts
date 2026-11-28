import { Module } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service.js";
import { GetAdminSummary } from "./application/get-admin-summary.js";
import { PrismaStockRepository } from "./infrastructure/prisma-stock-repository.js";
import { PrismaAdminSummaryReader } from "./infrastructure/prisma-admin-summary-reader.js";
import { AdminSummaryController } from "./presentation/admin-summary.controller.js";

@Module({
  controllers: [AdminSummaryController],
  providers: [
    {
      provide: GetAdminSummary,
      useFactory: (prisma: PrismaService) =>
        new GetAdminSummary(
          new PrismaAdminSummaryReader(prisma, new PrismaStockRepository(prisma)),
          () => new Date(),
        ),
      inject: [PrismaService],
    },
  ],
})
export class AdminModule {}
