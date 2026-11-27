import { Controller, Get, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createServerlessHandler } from "./handler.js";

@Controller("live")
class LiveStub {
  @Get()
  live() {
    return { status: "ok" };
  }
}

async function buildApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ controllers: [LiveStub] }).compile();
  return moduleRef.createNestApplication();
}

describe("handler serverless da API", () => {
  it("cria o aplicativo uma vez só, na primeira requisição, e o reaproveita nas seguintes", async () => {
    let created = 0;
    const handler = createServerlessHandler(async () => {
      created += 1;
      return buildApp();
    });

    const first = await request(handler).get("/live");
    const second = await request(handler).get("/live");
    const third = await request(handler).get("/live");

    expect([first.status, second.status, third.status]).toEqual([200, 200, 200]);
    expect(first.body).toEqual({ status: "ok" });
    expect(created).toBe(1);
  });

  it("se o aplicativo falhar ao subir, a falha chega à requisição e a próxima tenta de novo", async () => {
    let attempts = 0;
    const handler = createServerlessHandler(async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("WEB_ORIGIN inválido em produção");
      return buildApp();
    });

    const failed = await request(handler).get("/live");
    const retried = await request(handler).get("/live");

    expect(failed.status).toBe(500);
    expect(retried.status).toBe(200);
    expect(attempts).toBe(2);
  });
});
