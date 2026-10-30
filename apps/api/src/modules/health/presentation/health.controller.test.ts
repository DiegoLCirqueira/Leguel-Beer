import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { AppModule } from "../../../app.module.js";
import { DATABASE_HEALTH } from "../application/database-health.js";

describe("GET /health", () => {
  let app: INestApplication;

  async function startWithDatabase(isUp: () => Promise<boolean>): Promise<INestApplication> {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DATABASE_HEALTH)
      .useValue({ isUp })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    return app;
  }

  afterEach(async () => {
    await app.close();
  });

  it("responde 200 com o banco no ar", async () => {
    await startWithDatabase(() => Promise.resolve(true));

    const response = await request(app.getHttpServer()).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", database: "up" });
  });

  it("responde 503 com o banco fora do ar", async () => {
    await startWithDatabase(() => Promise.resolve(false));

    const response = await request(app.getHttpServer()).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({ status: "error", database: "down" });
  });
});
