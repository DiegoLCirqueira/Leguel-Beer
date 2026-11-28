import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module.js";
import { DATABASE_HEALTH } from "./modules/health/application/database-health.js";
import { setupApp } from "./setup-app.js";

describe("AppModule: rotas de admin nunca vão para o cache do navegador", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DATABASE_HEALTH)
      .useValue({ isUp: () => Promise.resolve(true) })
      .compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { webOrigin: "http://localhost:3000" });
    await app.init();
  });

  afterAll(() => app.close());

  it.each([
    "/admin/resumo",
    "/admin/cervejas",
    "/admin/pedidos/x/confirmar-pagamento",
    "/admin/nao-existe",
  ])("%s responde com Cache-Control: no-store, mesmo recusada", async (path) => {
    const response = await request(app.getHttpServer()).get(path);

    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("as rotas públicas não ganham o no-store do admin", async () => {
    const response = await request(app.getHttpServer()).get("/live");

    expect(response.headers["cache-control"]).not.toBe("no-store");
  });

  it("o catálogo público segue cacheável: GET /catalogo não ganha no-store", async () => {
    const response = await request(app.getHttpServer()).get("/catalogo");

    expect(response.headers["cache-control"]).not.toBe("no-store");
  });
});
