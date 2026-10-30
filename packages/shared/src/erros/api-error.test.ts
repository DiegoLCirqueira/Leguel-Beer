import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error.js";

describe("ApiError.fromBody", () => {
  it("tipa code, message e details de um erro 400 da API", () => {
    const error = ApiError.fromBody(400, {
      code: "VALIDATION_ERROR",
      message: "Dados inválidos.",
      details: [{ field: "telefone", message: "Informe um telefone com DDD." }],
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Dados inválidos.");
    expect(error.details).toEqual([{ field: "telefone", message: "Informe um telefone com DDD." }]);
  });

  it("aceita erro sem details", () => {
    const error = ApiError.fromBody(404, { code: "NOT_FOUND", message: "Recurso não encontrado." });

    expect(error.details).toBeUndefined();
  });

  it("usa um erro genérico quando o corpo não está no formato da API", () => {
    const error = ApiError.fromBody(502, "<html>Bad gateway</html>");

    expect(error.status).toBe(502);
    expect(error.code).toBe("HTTP_ERROR");
    expect(error.message).toBe("Não foi possível processar a requisição.");
  });
});
