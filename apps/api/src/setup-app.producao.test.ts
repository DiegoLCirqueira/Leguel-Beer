import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module.js";
import { DATABASE_HEALTH } from "./modules/health/application/database-health.js";
import { setupApp } from "./setup-app.js";

describe("configuração global em produção", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DATABASE_HEALTH)
      .useValue({ isUp: () => Promise.resolve(true) })
      .compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { webOrigin: "https://leguele-web.vercel.app", production: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("não expõe o Swagger: /docs e /docs-json respondem 404", async () => {
    const page = await request(app.getHttpServer()).get("/docs");
    const json = await request(app.getHttpServer()).get("/docs-json");

    expect(page.status).toBe(404);
    expect(json.status).toBe(404);
  });

  it("mantém a política de conteúdo (CSP) do helmet ligada", async () => {
    const response = await request(app.getHttpServer()).get("/live");

    expect(response.headers["content-security-policy"]).toBeDefined();
  });

  it("o CORS libera só a origem do site e nunca liga Allow-Credentials", async () => {
    const allowed = await request(app.getHttpServer())
      .get("/live")
      .set("Origin", "https://leguele-web.vercel.app");
    const denied = await request(app.getHttpServer())
      .get("/live")
      .set("Origin", "https://outro-site.example");

    expect(allowed.headers["access-control-allow-origin"]).toBe("https://leguele-web.vercel.app");
    expect(allowed.headers["access-control-allow-credentials"]).toBeUndefined();
    expect(denied.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
