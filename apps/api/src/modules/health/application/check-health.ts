import type { DatabaseHealth } from "./database-health.js";

export interface HealthReport {
  status: "ok" | "error";
  database: "up" | "down";
}

export class CheckHealth {
  constructor(private readonly database: DatabaseHealth) {}

  async execute(): Promise<HealthReport> {
    const up = await this.database.isUp();
    return up ? { status: "ok", database: "up" } : { status: "error", database: "down" };
  }
}
