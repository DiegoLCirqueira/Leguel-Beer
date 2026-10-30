import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";

export interface SetupOptions {
  webOrigin: string;
}

/** Configuração global compartilhada entre a API real (main.ts) e os testes HTTP. */
export function setupApp(app: INestApplication, { webOrigin }: SetupOptions): void {
  (app as NestExpressApplication).disable("x-powered-by");
  // API de JSON: sem CSP, para o Swagger UI em /docs carregar seus scripts.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({ origin: [webOrigin] });
  app.enableShutdownHooks();

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("Leguelé Beer API").setVersion("0.0.0").addBearerAuth().build(),
  );
  SwaggerModule.setup("docs", app, document, { jsonDocumentUrl: "docs-json" });
}
