import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "./app.module.js";
import { DATABASE_HEALTH } from "./modules/health/application/database-health.js";
import { setupApp } from "./setup-app.js";

describe("AppModule: teto do limite global em produção", () => {
  let app: INestApplication;

  beforeAll(async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("THROTTLE_LIMIT", "1005");
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

  it("com THROTTLE_LIMIT=1005 em produção, a requisição 1001 do minuto responde 429", async () => {
    let last = 0;
    let accepted = 0;
    for (let i = 0; i < 1001; i += 1) {
      last = (await request(app.getHttpServer()).get("/health")).status;
      if (last === 200) accepted += 1;
    }

    expect(accepted).toBe(1000);
    expect(last).toBe(429);
  }, 60_000);
});
