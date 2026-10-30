import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module.js";
import { DATABASE_HEALTH } from "./modules/health/application/database-health.js";
import { setupApp } from "./setup-app.js";

describe("configuração global da aplicação", () => {
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

  afterAll(async () => {
    await app.close();
  });

  it("expõe o Swagger em /docs com Bearer e a tag health", async () => {
    const page = await request(app.getHttpServer()).get("/docs");
    const json = await request(app.getHttpServer()).get("/docs-json");

    expect(page.status).toBe(200);
    expect(json.body.components.securitySchemes.bearer).toMatchObject({
      type: "http",
      scheme: "bearer",
    });
    expect(json.body.paths["/health"]).toBeDefined();
    expect(json.body.paths["/health"].get.tags).toContain("health");
  });

  it("envia cabeçalhos de segurança do helmet", async () => {
    const response = await request(app.getHttpServer()).get("/health");

    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("libera o CORS só para a origem do web", async () => {
    const allowed = await request(app.getHttpServer())
      .get("/health")
      .set("Origin", "http://localhost:3000");
    const denied = await request(app.getHttpServer())
      .get("/health")
      .set("Origin", "http://evil.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("limita a 100 requisições por minuto por IP com o erro padronizado", async () => {
    let last = await request(app.getHttpServer()).get("/health");
    for (let i = 0; i < 100; i++) last = await request(app.getHttpServer()).get("/health");

    expect(last.status).toBe(429);
    expect(last.body.code).toBe("TOO_MANY_REQUESTS");
  });
});
