import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { AppLogger } from "./common/logging/app-logger.js";
import { setupApp } from "./setup-app.js";

const PORT = 3333;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(AppLogger));
  setupApp(app, { webOrigin: process.env["WEB_ORIGIN"] ?? "http://localhost:3000" });
  await app.listen(PORT);
}

void bootstrap();
