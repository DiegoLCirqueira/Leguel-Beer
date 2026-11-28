import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppModule } from "./app.module.js";
import { DATABASE_HEALTH } from "./modules/health/application/database-health.js";
import { setupApp } from "./setup-app.js";

describe("limite por IP atrás do proxy da Vercel", () => {
  let app: INestApplication;

  beforeAll(async () => {
    vi.stubEnv("THROTTLE_LIMIT", "3");
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DATABASE_HEALTH)
      .useValue({ isUp: () => Promise.resolve(true) })
      .compile();
    app = moduleRef.createNestApplication();
    setupApp(app, { webOrigin: "http://localhost:3000", production: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  const live = (forwardedFor: string) =>
    request(app.getHttpServer()).get("/live").set("X-Forwarded-For", forwardedFor);

  it("conta o último IP do X-Forwarded-For (o que a Vercel acrescentou) e ignora o forjado", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 4; i += 1) statuses.push((await live(`9.9.9.${i}, 1.2.3.4`)).status);

    expect(statuses).toEqual([200, 200, 200, 429]);
  });

  it("IPs reais diferentes têm limites separados", async () => {
    const other = await live("9.9.9.9, 5.6.7.8");

    expect(other.status).toBe(200);
  });
});
