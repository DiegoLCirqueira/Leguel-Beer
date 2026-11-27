import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";

export interface SetupOptions {
  webOrigin: string;
  /** Em produção o Swagger fica desligado e a política de conteúdo (CSP) do helmet, ligada. */
  production?: boolean;
}

/** Configuração global compartilhada entre a API real (main.ts) e os testes HTTP. */
export function setupApp(
  app: INestApplication,
  { webOrigin, production = false }: SetupOptions,
): void {
  (app as NestExpressApplication).disable("x-powered-by");
  // Atrás do proxy da Vercel: confia só no primeiro salto (nunca `true`), então o IP contado no
  // limite é o último do X-Forwarded-For, o que a Vercel acrescentou, e não o forjado pelo cliente.
  (app as NestExpressApplication).set("trust proxy", 1);
  // Fora de produção, sem CSP: o Swagger UI em /docs precisa carregar seus scripts.
  app.use(helmet({ contentSecurityPolicy: production ? undefined : false }));
  app.enableCors({ origin: [webOrigin] });
  app.enableShutdownHooks();

  if (production) return;

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle("Leguelé Beer API").setVersion("0.0.0").addBearerAuth().build(),
  );
  SwaggerModule.setup("docs", app, document, { jsonDocumentUrl: "docs-json" });
}
