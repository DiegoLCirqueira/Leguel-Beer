import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import type { DatabaseHealth } from "../application/database-health.js";

@Injectable()
export class PrismaDatabaseHealth implements DatabaseHealth {
  constructor(private readonly prisma: PrismaService) {}

  async isUp(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
