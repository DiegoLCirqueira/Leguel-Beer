import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "./app.module.js";
import { DATABASE_HEALTH } from "./modules/health/application/database-health.js";
import { setupApp } from "./setup-app.js";

describe("AppModule: limite global de requisições por IP", () => {
  let app: INestApplication;

  beforeAll(async () => {
    vi.stubEnv("THROTTLE_LIMIT", "3");
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
    vi.unstubAllEnvs();
  });

  it("usa o THROTTLE_LIMIT do ambiente: a 4ª requisição do minuto responde 429", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) {
      statuses.push((await request(app.getHttpServer()).get("/health")).status);
    }

    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});
