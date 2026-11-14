import { Catch, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";
import { toErrorResponse } from "../errors/error-response.js";
import { AppLogger } from "../logging/app-logger.js";
import { REQUEST_ID_HEADER } from "./request-id.middleware.js";

/**
 * Descrição do erro para o log, sem a mensagem: ela pode trazer dado pessoal (endereço devolvido por
 * serviço de mapas, valores de uma chamada ao banco). Ficam o nome, o código e os quadros da pilha.
 */
function describeForLog(exception: unknown): Record<string, unknown> {
  if (!(exception instanceof Error)) return { type: typeof exception };
  const code = (exception as { code?: unknown }).code;
  const frames = (exception.stack ?? "")
    .split("\n")
    .filter((line) => /^\s+at /.test(line))
    .join("\n");
  return {
    name: exception.name,
    ...(typeof code === "string" && { code }),
    stack: frames,
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
