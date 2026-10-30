import { Controller, Get, HttpStatus, Inject, Res } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { CheckHealth, type HealthReport } from "../application/check-health.js";
import { DATABASE_HEALTH, type DatabaseHealth } from "../application/database-health.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  private readonly checkHealth: CheckHealth;

  constructor(@Inject(DATABASE_HEALTH) database: DatabaseHealth) {
    this.checkHealth = new CheckHealth(database);
  }

  @Get()
  @ApiOperation({ summary: "Estado da API e do banco" })
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthReport> {
    const report = await this.checkHealth.execute();
    if (report.status === "error") res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
