import "reflect-metadata";
import { createApp } from "../src/create-app.js";
import { createServerlessHandler } from "../src/serverless/handler.js";

// Entrada serverless da Vercel: o aplicativo é criado uma vez por instância e reaproveitado. Sem
// `listen` nem `.env`: as variáveis vêm do ambiente da plataforma.
export default createServerlessHandler(() => createApp(process.env));
