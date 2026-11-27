import "reflect-metadata";
import { createApp } from "./create-app.js";

const PORT = 3333;

// Em desenvolvimento as variáveis vêm do .env local; em produção, do ambiente da plataforma.
try {
  process.loadEnvFile();
} catch {
  // sem .env: usa o ambiente
}

async function bootstrap(): Promise<void> {
  const app = await createApp(process.env);
  await app.listen(PORT);
}

void bootstrap();
