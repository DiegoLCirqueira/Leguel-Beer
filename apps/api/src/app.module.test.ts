import { Controller, Get, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module.js";
import { DATABASE_HEALTH } from "./modules/health/application/database-health.js";
import { setupApp } from "./setup-app.js";

@Controller("sonda")
class SondaController {
  @Get()
  fechada() {
    return { ok: true };
  }
}

describe("AppModule: rotas protegidas por padrão", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [SondaController],
    })
      .overrideProvider(DATABASE_HEALTH)
      .useValue({ isUp: () => Promise.resolve(true) })
      .compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { webOrigin: "http://localhost:3000" });
    await app.init();
  });

  afterAll(() => app.close());

  it("uma rota nova sem marcação exige token", async () => {
    const response = await request(app.getHttpServer()).get("/sonda");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("GET /health e GET /docs continuam abertos, sem token", async () => {
    const health = await request(app.getHttpServer()).get("/health");
    const docs = await request(app.getHttpServer()).get("/docs");

    expect(health.status).toBe(200);
    expect(docs.status).toBe(200);
  });

  it("o Swagger documenta POST e GET /me/profile com Bearer e os erros", async () => {
    const { body } = await request(app.getHttpServer()).get("/docs-json");

    const rota = body.paths["/me/profile"];
    expect(Object.keys(rota)).toEqual(expect.arrayContaining(["post", "get"]));
    expect(rota.post.security).toEqual([{ bearer: [] }]);
    expect(Object.keys(rota.post.responses)).toEqual(
      expect.arrayContaining(["200", "201", "400", "401"]),
    );
    expect(Object.keys(rota.get.responses)).toEqual(expect.arrayContaining(["200", "401", "404"]));
    expect(rota.post.requestBody.content["application/json"].schema.properties).toHaveProperty(
      "telefone",
    );
  });
});
