import { Catch, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";
import { toErrorResponse } from "../errors/error-response.js";
import { AppLogger } from "../logging/app-logger.js";
import { REQUEST_ID_HEADER } from "./request-id.middleware.js";

/** Só identificadores: letras, dígitos, `_` e `-`, no máximo 60. Qualquer outro texto vira `[omitido]`. */
const SAFE_IDENTIFIER = /^[A-Za-z0-9_-]{1,60}$/;

function safeIdentifier(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  return SAFE_IDENTIFIER.test(value) ? value : "[omitido]";
}

/**
 * Descrição do erro para o log: só o nome e o código, cada um limitado a um identificador. Nem a
 * mensagem nem a pilha entram, porque as duas carregam texto livre (uma mensagem com quebra de linha
 * imita um quadro de pilha) e podem trazer dado pessoal, como o endereço devolvido por um serviço de
 * mapas ou os valores de uma chamada ao banco.
 */
function describeForLog(exception: unknown): Record<string, unknown> {
  if (!(exception instanceof Error)) return { type: typeof exception };
  const code = safeIdentifier((exception as { code?: unknown }).code);
  return {
    name: safeIdentifier(exception.name),
    ...(code !== undefined && { code }),
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const { status, body } = toErrorResponse(exception);

    if (status >= 500) {
      this.logger.error("Erro não tratado", {
        requestId: req.header(REQUEST_ID_HEADER),
        method: req.method,
        path: req.originalUrl,
        error: describeForLog(exception),
      });
    }
    res.status(status).json(body);
  }
}
