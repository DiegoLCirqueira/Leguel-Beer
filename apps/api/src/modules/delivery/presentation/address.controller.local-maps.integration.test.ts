import type { INestApplication } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { cotacaoDeFreteSchema, listaDeEnderecosSchema } from "@leguele/shared";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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
import { seedDeliverySettings } from "../infrastructure/seed-delivery-settings.js";

describe("endereços e frete com os mapas locais do MVP (MAPS_ADAPTER=local, banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    vi.stubEnv("MAPS_ADAPTER", "local");
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
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    app.get(AccountRateLimiter, { strict: false }).reset();
    await resetDatabase(prisma);
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
    await seedDeliverySettings(prisma);
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs();
  });

  const auth = { Authorization: `Bearer ${tokens.customer()}` };

  const save = (overrides: Record<string, string> = {}) =>
    request(app.getHttpServer())
      .post("/me/enderecos")
      .set(auth)
      .send({
        cep: "57035-000",
        rua: "Rua do Sol",
        numero: "100",
        bairro: "Farol",
        cidade: "Maceió",
        uf: "AL",
        ...overrides,
      });

  it("salva o endereço de Maceió, dentro da área, e o lista sem erro", async () => {
    const created = await save();

    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ bairro: "Farol", foraDaArea: false });
    const list = await request(app.getHttpServer()).get("/me/enderecos").set(auth);
    expect(listaDeEnderecosSchema.parse(list.body)).toHaveLength(1);
  });

  it("guarda coordenadas aproximadas e a distância em linha reta até a origem", async () => {
    await save();

    const row = await prisma.address.findFirstOrThrow();
    expect(row.latitude).toBeCloseTo(-9.656, 3);
    expect(row.longitude).toBeCloseTo(-35.735, 3);
    expect(row.distanceMeters).toBeGreaterThan(0);
    expect(row.distanceMeters).toBeLessThan(25_000);
  });

  it("cota o frete do endereço dentro da área, com valor, e marca fora da área um município distante", async () => {
    const inside = (await save()).body as { id: string };
    const outside = (await save({ cidade: "Murici", bairro: "Centro", cep: "57820-000" })).body as {
      id: string;
      foraDaArea: boolean;
    };

    const quoteInside = await request(app.getHttpServer())
      .get(`/me/enderecos/${inside.id}/frete`)
      .set(auth);
    const quoteOutside = await request(app.getHttpServer())
      .get(`/me/enderecos/${outside.id}/frete`)
      .set(auth);

    expect(outside.foraDaArea).toBe(true);
    const insideBody = cotacaoDeFreteSchema.parse(quoteInside.body);
    expect(insideBody.naArea).toBe(true);
    expect(insideBody.naArea && insideBody.freteCentavos).toBeGreaterThan(0);
    expect(cotacaoDeFreteSchema.parse(quoteOutside.body)).toEqual({ naArea: false });
  });

  it("cidade fora da tabela responde 422 ADDRESS_NOT_LOCATED e não grava nada", async () => {
    const response = await save({ cidade: "Cidade Inventada" });

    expect(response.status).toBe(422);
    expect(response.body.code).toBe("ADDRESS_NOT_LOCATED");
    expect(await prisma.address.count()).toBe(0);
  });
});
