import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { NotFoundError } from "./not-found-error.js";
import { ValidationError } from "./validation-error.js";
import { toErrorResponse } from "./error-response.js";

describe("toErrorResponse", () => {
  it("transforma NotFoundError em 404 NOT_FOUND, igual ao NotFoundException", () => {
    expect(toErrorResponse(new NotFoundError())).toEqual(toErrorResponse(new NotFoundException()));
    expect(toErrorResponse(new NotFoundError()).status).toBe(404);
  });

  it("transforma ValidationError em 400 VALIDATION_ERROR com os campos em details", () => {
    const error = new ValidationError([{ field: "quantidade", message: "Esperado número" }]);

    expect(toErrorResponse(error)).toEqual({
      status: 400,
      body: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos.",
        details: [{ field: "quantidade", message: "Esperado número" }],
      },
    });
  });

  it.each([
    [new BadRequestException(), 400, "BAD_REQUEST", "Requisição inválida."],
    [new UnauthorizedException(), 401, "UNAUTHORIZED", "Não autenticado."],
    [new ForbiddenException(), 403, "FORBIDDEN", "Acesso negado."],
    [new NotFoundException(), 404, "NOT_FOUND", "Recurso não encontrado."],
    [
      new HttpException("x", 429),
      429,
      "TOO_MANY_REQUESTS",
      "Muitas requisições. Tente novamente em instantes.",
    ],
  ])("mapeia %o para o status e o code padronizados", (error, status, code, message) => {
    expect(toErrorResponse(error)).toEqual({ status, body: { code, message } });
  });

  it("mapeia 409 para CONFLICT", () => {
    expect(toErrorResponse(new HttpException("x", 409))).toEqual({
      status: 409,
      body: { code: "CONFLICT", message: "Conflito com o estado atual do recurso." },
    });
  });

  it.each([405, 413, 415, 422])(
    "mantém o status %i fora do mapa com um code genérico",
    (status) => {
      expect(toErrorResponse(new HttpException("x", status))).toEqual({
        status,
        body: { code: "HTTP_ERROR", message: "Não foi possível processar a requisição." },
      });
    },
  );

  it("mantém o status 5xx de HttpException com INTERNAL_ERROR genérico", () => {
    expect(toErrorResponse(new HttpException("detalhe interno", 503))).toEqual({
      status: 503,
      body: { code: "INTERNAL_ERROR", message: "Erro interno. Tente novamente mais tarde." },
    });
  });

  it("transforma erro desconhecido em 500 INTERNAL_ERROR sem vazar a mensagem original", () => {
    const result = toErrorResponse(new Error("select * from users falhou: senha=123"));

    expect(result).toEqual({
      status: 500,
      body: { code: "INTERNAL_ERROR", message: "Erro interno. Tente novamente mais tarde." },
    });
  });

  it("trata valores não-Error lançados como erro interno", () => {
    expect(toErrorResponse("boom").status).toBe(500);
  });
});
