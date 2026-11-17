import type { INestApplication } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CommonModule } from "../../../common/common.module.js";
import { AccountRateLimiter } from "../../../common/http/account-rate-limiter.js";
import { AllExceptionsFilter } from "../../../common/http/all-exceptions.filter.js";
import { PrismaModule } from "../../../common/prisma/prisma.module.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { createTestTokens } from "../../../common/testing/tokens.js";
import { ZodValidationPipe } from "../../../common/validation/zod-validation.pipe.js";
import { AccountModule } from "../../account/account.module.js";
import { TOKEN_VERIFIER } from "../../account/account.tokens.js";
import { JwksTokenVerifier } from "../../account/infrastructure/jwks-token-verifier.js";
import { DeliveryModule } from "../delivery.module.js";
import { GEOCODER, ROUTE_CALCULATOR } from "../delivery.tokens.js";
import { seedDeliverySettings } from "../infrastructure/seed-delivery-settings.js";
import { FakeGeocoder, FakeRouteCalculator } from "../testing/fake-maps.js";

describe("limite de salvar e editar endereço por conta (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  const geocoder = new FakeGeocoder();
  const router = new FakeRouteCalculator();
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule, AccountModule, DeliveryModule],
      providers: [
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_PIPE, useClass: ZodValidationPipe },
      ],
    })
      .overrideProvider(TOKEN_VERIFIER)
      .useValue(verifier)
      .overrideProvider(GEOCODER)
      .useValue(geocoder)
      .overrideProvider(ROUTE_CALCULATOR)
      .useValue(router)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
    await seedDeliverySettings(prisma);
    app.get(AccountRateLimiter, { strict: false }).reset();
    geocoder.received.length = 0;
    router.received.length = 0;
    geocoder.respondWith({ latitude: -9.66, longitude: -35.74 });
    router.respondWith(5_200);
  });

  afterAll(() => app.close());

  const form = {
    cep: "57035-000",
    rua: "Rua do Sol",
    numero: "100",
    bairro: "Farol",
    cidade: "Maceió",
    uf: "AL",
  };

  const call = (method: "post" | "put" | "get", path: string, token: string, body?: object) =>
    request(app.getHttpServer())
      [method](path)
      .set({ Authorization: `Bearer ${token}` })
      .send(body);

  const LIMIT = 10;

  async function createAddress(token: string): Promise<string> {
    const response = await call("post", "/me/enderecos", token, form);
    expect(response.status).toBe(201);
    return (response.body as { id: string }).id;
  }

  it("a 11ª gravação da mesma conta no minuto responde 429 sem chamar os mapas nem gravar", async () => {
    const id = await createAddress(tokens.customer());
    for (let i = 1; i < LIMIT; i++) {
      expect((await call("put", `/me/enderecos/${id}`, tokens.customer(), form)).status).toBe(200);
    }
    geocoder.received.length = 0;
    router.received.length = 0;

    const blocked = await call("put", `/me/enderecos/${id}`, tokens.customer(), {
      ...form,
      rua: "Rua Bloqueada",
    });

    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ code: "TOO_MANY_REQUESTS" });
    expect(geocoder.received).toHaveLength(0);
    expect(router.received).toHaveLength(0);
    expect((await prisma.address.findUniqueOrThrow({ where: { id } })).street).toBe("Rua do Sol");
  });

  it("criar e editar dividem a mesma cota", async () => {
    const id = await createAddress(tokens.customer());
    for (let i = 1; i < LIMIT; i++) {
      await call("put", `/me/enderecos/${id}`, tokens.customer(), form);
    }

    const blocked = await call("post", "/me/enderecos", tokens.customer(), form);

    expect(blocked.status).toBe(429);
  });

  it("a cota é por conta: outra conta segue gravando", async () => {
    await prisma.profile.create({ data: { id: tokens.adminId, email: "outra@leguele.test" } });
    const id = await createAddress(tokens.customer());
    for (let i = 1; i <= LIMIT; i++) {
      await call("put", `/me/enderecos/${id}`, tokens.customer(), form);
    }

    expect((await call("post", "/me/enderecos", tokens.admin(), form)).status).toBe(201);
  });

  it("ler a lista e cotar o frete não gastam a cota", async () => {
    const id = await createAddress(tokens.customer());
    for (let i = 0; i < LIMIT * 2; i++) {
      expect((await call("get", "/me/enderecos", tokens.customer())).status).toBe(200);
      expect((await call("get", `/me/enderecos/${id}/frete`, tokens.customer())).status).toBe(200);
    }

    expect((await call("put", `/me/enderecos/${id}`, tokens.customer(), form)).status).toBe(200);
  });
});
