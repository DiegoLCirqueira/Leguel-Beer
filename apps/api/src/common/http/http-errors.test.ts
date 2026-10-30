import { Body, Controller, Get, Module, Post, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { z } from "zod";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppModule } from "../../app.module.js";
import { AppLogger } from "../logging/app-logger.js";
import { zodDto } from "../validation/zod-dto.js";

class QuantidadeDto extends zodDto(z.object({ quantidade: z.number() })) {}

@Controller("exemplo")
class ExemploController {
  @Post("validacao")
  validar(@Body() body: QuantidadeDto): { quantidade: number } {
    return { quantidade: body.quantidade };
  }

  @Get("erro")
  falhar(): never {
    throw new Error("select * from usuarios falhou: senha=123");
  }
}

@Module({ controllers: [ExemploController] })
class ExemploModule {}

class FakeLogger {
  entries: { level: string; message: string; context?: Record<string, unknown> }[] = [];
  info(message: string, context?: Record<string, unknown>): void {
    this.entries.push({ level: "info", message, context });
  }
  error(message: string, context?: Record<string, unknown>): void {
    this.entries.push({ level: "error", message, context });
  }
}

describe("erros padronizados via HTTP", () => {
  let app: INestApplication;
  const logger = new FakeLogger();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule, ExemploModule] })
      .overrideProvider(AppLogger)
      .useValue(logger)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    logger.entries = [];
  });

  afterAll(async () => {
    await app.close();
  });

  it("devolve 400 VALIDATION_ERROR com o campo inválido em details", async () => {
    const response = await request(app.getHttpServer())
      .post("/exemplo/validacao")
      .send({ quantidade: "abc" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(typeof response.body.message).toBe("string");
    expect(response.body.details).toEqual([expect.objectContaining({ field: "quantidade" })]);
  });

  it("aceita a entrada válida", async () => {
    const response = await request(app.getHttpServer())
      .post("/exemplo/validacao")
      .send({ quantidade: 3 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ quantidade: 3 });
  });

  it("devolve 500 INTERNAL_ERROR sem vazar stack nem a mensagem original", async () => {
    const response = await request(app.getHttpServer()).get("/exemplo/erro");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      code: "INTERNAL_ERROR",
      message: "Erro interno. Tente novamente mais tarde.",
    });
    expect(response.text).not.toContain("select * from usuarios");
    expect(response.text).not.toContain("senha=123");
    expect(response.text).not.toMatch(/\bat .*\(.*:\d+:\d+\)/);
  });

  it("registra o erro no log com o mesmo id do cabeçalho x-request-id", async () => {
    const response = await request(app.getHttpServer()).get("/exemplo/erro");

    const requestId = response.headers["x-request-id"];
    expect(requestId).toBeTruthy();
    const logged = logger.entries.find((e) => e.level === "error");
    expect(logged?.context).toMatchObject({ requestId });
  });

  it("reaproveita o x-request-id recebido", async () => {
    const response = await request(app.getHttpServer())
      .get("/exemplo/erro")
      .set("x-request-id", "abc-123");

    expect(response.headers["x-request-id"]).toBe("abc-123");
  });

  it("devolve 404 NOT_FOUND no formato padrão", async () => {
    const response = await request(app.getHttpServer()).get("/nao-existe");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ code: "NOT_FOUND", message: "Recurso não encontrado." });
  });
});
