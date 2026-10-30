import { Catch, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Request, Response } from "express";
import { toErrorResponse } from "../errors/error-response.js";
import { AppLogger } from "../logging/app-logger.js";
import { REQUEST_ID_HEADER } from "./request-id.middleware.js";

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
        error:
          exception instanceof Error
            ? { name: exception.name, message: exception.message, stack: exception.stack }
            : String(exception),
      });
    }
    res.status(status).json(body);
  }
}
