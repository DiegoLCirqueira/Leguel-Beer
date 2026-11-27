import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";
import { isProductionEnv } from "./common/config/production-env.js";
import { resolveWebOrigin } from "./common/config/web-origin.js";
import { AppLogger } from "./common/logging/app-logger.js";
import { setupApp } from "./setup-app.js";

/**
 * Cria o aplicativo com a configuração global: a mesma para o `main.ts` (desenvolvimento e CI) e
 * para a entrada serverless da Vercel. Em produção `WEB_ORIGIN` é validado antes de qualquer coisa.
 */
export async function createApp(
  env: Record<string, string | undefined>,
): Promise<NestExpressApplication> {
  const webOrigin = resolveWebOrigin(env);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(AppLogger));
  setupApp(app, { webOrigin, production: isProductionEnv(env) });
  return app;
}
