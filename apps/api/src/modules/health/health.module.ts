import { Module } from "@nestjs/common";
import { DATABASE_HEALTH } from "./application/database-health.js";
import { PrismaDatabaseHealth } from "./infrastructure/prisma-database-health.js";
import { LiveController } from "./presentation/live.controller.js";
import { HealthController } from "./presentation/health.controller.js";

@Module({
  controllers: [HealthController, LiveController],
  providers: [{ provide: DATABASE_HEALTH, useClass: PrismaDatabaseHealth }],
})
export class HealthModule {}
