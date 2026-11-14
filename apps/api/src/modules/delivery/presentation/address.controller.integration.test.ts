import { enderecoRespostaSchema, listaDeEnderecosSchema } from "@leguele/shared";
import type { INestApplication } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { CommonModule } from "../../../common/common.module.js";
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

describe("endereços do cliente (HTTP, banco real)", () => {
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
    geocoder.respondWith({ latitude: -9.66, longitude: -35.74 });
    router.respondWith(5_200);
  });

  afterAll(() => app.close());

  const list = (token?: string) =>
    request(app.getHttpServer())
      .get("/me/enderecos")
      .set(token ? { Authorization: `Bearer ${token}` } : {});

  it("sem token responde 401", async () => {
    expect((await list()).status).toBe(401);
  });

  it("devolve a lista vazia para o cliente sem endereços, no formato do contrato", async () => {
    const response = await list(tokens.customer());

    expect(response.status).toBe(200);
    expect(listaDeEnderecosSchema.parse(response.body)).toEqual([]);
  });

  it("sem a configuração de entrega responde 503 DELIVERY_SETTINGS_MISSING, sem stack nem detalhe interno", async () => {
    await prisma.deliverySettings.deleteMany();

    const response = await list(tokens.customer());

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      code: "DELIVERY_SETTINGS_MISSING",
      message: "A entrega está indisponível no momento. Tente de novo em instantes.",
    });
    expect(JSON.stringify(response.body)).not.toMatch(/stack|DeliverySettingsNotConfigured|at \w/);
  });

  const form = {
    cep: "57035-000",
    rua: "Rua do Sol",
    numero: "100",
    bairro: "Farol",
    cidade: "Maceió",
    uf: "AL",
  };

  const create = (body: object, token = tokens.customer()) =>
    request(app.getHttpServer())
      .post("/me/enderecos")
      .set({ Authorization: `Bearer ${token}` })
      .send(body);

  it("salva o primeiro endereço como padrão e grava as coordenadas calculadas pela API, ignorando as do corpo", async () => {
    const response = await create({ ...form, latitude: 10, longitude: 20, distanciaMetros: 1 });

    expect(response.status).toBe(201);
    expect(enderecoRespostaSchema.parse(response.body)).toMatchObject({
      cep: "57035000",
      rua: "Rua do Sol",
      padrao: true,
      foraDaArea: false,
    });
    const [saved] = await prisma.address.findMany();
    expect(saved).toMatchObject({
      profileId: tokens.customerId,
      latitude: -9.66,
      longitude: -35.74,
      distanceMeters: 5_200,
      isDefault: true,
    });
  });
});
