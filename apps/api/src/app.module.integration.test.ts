import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "./app.module.js";
import { setupApp } from "./setup-app.js";

describe("AppModule com banco real", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { webOrigin: "http://localhost:3000" });
    await app.init();
  });

  afterAll(() => app.close());

  it("GET /catalogo está no ar e é público (convidado navega sem token)", async () => {
    const response = await request(app.getHttpServer()).get("/catalogo");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("itens");
  });
});
