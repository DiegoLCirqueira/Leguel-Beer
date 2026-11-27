import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { AppModule } from "../../../app.module.js";
import { DATABASE_HEALTH } from "../application/database-health.js";

describe("GET /live", () => {
  let app: INestApplication;

  afterEach(async () => {
    await app.close();
  });

  it("responde 200 sem consultar o banco, mesmo com o banco fora do ar", async () => {
    let consultas = 0;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DATABASE_HEALTH)
      .useValue({
        isUp: () => {
          consultas += 1;
          return Promise.resolve(false);
        },
      })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const response = await request(app.getHttpServer()).get("/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(consultas).toBe(0);
  });
});
