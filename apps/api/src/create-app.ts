import type { NestExpressApplication } from "@nestjs/platform-express";

export async function createApp(_env: Record<string, string | undefined>): Promise<NestExpressApplication> {
  throw new Error("não implementado");
}
