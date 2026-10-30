import { HttpException } from "@nestjs/common";
import { NotFoundError } from "./not-found-error.js";
import { ValidationError, type FieldIssue } from "./validation-error.js";

export interface ErrorBody {
  code: string;
  message: string;
  details?: FieldIssue[];
}

export interface ErrorResponse {
  status: number;
  body: ErrorBody;
}

const BY_STATUS: Record<number, { code: string; message: string }> = {
  400: { code: "BAD_REQUEST", message: "Requisição inválida." },
  401: { code: "UNAUTHORIZED", message: "Não autenticado." },
  403: { code: "FORBIDDEN", message: "Acesso negado." },
  404: { code: "NOT_FOUND", message: "Recurso não encontrado." },
  409: { code: "CONFLICT", message: "Conflito com o estado atual do recurso." },
  429: { code: "TOO_MANY_REQUESTS", message: "Muitas requisições. Tente novamente em instantes." },
};

const GENERIC_HTTP: ErrorBody = {
  code: "HTTP_ERROR",
  message: "Não foi possível processar a requisição.",
};

const INTERNAL: ErrorBody = {
  code: "INTERNAL_ERROR",
  message: "Erro interno. Tente novamente mais tarde.",
};

export function toErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: { code: "VALIDATION_ERROR", message: error.message, details: error.issues },
    };
  }
  if (error instanceof NotFoundError) {
    return { status: 404, body: BY_STATUS[404] as ErrorBody };
  }
  if (error instanceof HttpException) {
    const mapped = BY_STATUS[error.getStatus()];
    const status = error.getStatus();
    if (mapped) return { status, body: mapped };
    return { status, body: status >= 500 ? INTERNAL : GENERIC_HTTP };
  }
  return { status: 500, body: INTERNAL };
}
