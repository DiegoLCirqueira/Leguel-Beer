import type { INestApplication } from "@nestjs/common";
import type { IncomingMessage, ServerResponse } from "node:http";

export type RequestHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

type Listener = (req: IncomingMessage, res: ServerResponse) => void;

/**
 * Entrega a requisição ao Express do Nest, criando o aplicativo uma vez por instância (a promessa
 * fica em memória e é reaproveitada entre invocações). Se a criação falhar, responde 500 e a
 * próxima invocação tenta de novo.
 */
export function createServerlessHandler(create: () => Promise<INestApplication>): RequestHandler {
  let listener: Promise<Listener> | undefined;

  return async (req, res) => {
    listener ??= create().then(async (app) => {
      await app.init();
      return app.getHttpAdapter().getInstance() as Listener;
    });
    try {
      (await listener)(req, res);
    } catch (error) {
      listener = undefined;
      // Falha ao subir (ex.: WEB_ORIGIN inválido em produção): log claro e 500 no formato da API.
      process.stderr.write(
        `${JSON.stringify({ level: "error", message: "Falha ao criar a API", reason: error instanceof Error ? error.message : "desconhecida" })}
`,
      );
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ code: "INTERNAL_ERROR", message: "Erro interno do servidor." }));
    }
  };
}
