import { cotacaoDeFreteSchema } from "@leguele/shared";
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

describe("GET /me/enderecos/:id/frete (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  const geocoder = new FakeGeocoder();
  const router = new FakeRouteCalculator();
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryId: string;

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
    app.get(AccountRateLimiter, { strict: false }).reset();
    await resetDatabase(prisma);
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
    await seedDeliverySettings(prisma);
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } }))
      .id;
    geocoder.respondWith({ latitude: -9.66, longitude: -35.74 });
    router.respondWith(5_200);
  });

  afterAll(() => app.close());

  const saveAddress = async (): Promise<string> => {
    const response = await request(app.getHttpServer())
      .post("/me/enderecos")
      .set({ Authorization: `Bearer ${tokens.customer()}` })
      .send({
        cep: "57035-000",
        rua: "Rua do Sol",
        numero: "100",
        bairro: "Farol",
        cidade: "Maceió",
        uf: "AL",
      });
    expect(response.status).toBe(201);
    return (response.body as { id: string }).id;
  };

  const putInFridge = async (priceCents: number, quantity: number) => {
    const beer = await prisma.beer.create({
      data: {
        slug: `ipa-${priceCents}`,
        name: "IPA",
        style: "American IPA",
        categoryId,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents,
        stock: 100,
      },
    });
    await prisma.fridge.create({
      data: {
        profileId: tokens.customerId,
        items: { create: [{ beerId: beer.id, quantity, seenPriceCents: priceCents, position: 0 }] },
      },
    });
  };

  const quote = (id: string, token?: string) =>
    request(app.getHttpServer())
      .get(`/me/enderecos/${id}/frete`)
      .set(token ? { Authorization: `Bearer ${token}` } : {});

  it("sem token responde 401", async () => {
    expect((await quote("0b0f6f0e-3f65-4e4e-8a4e-5d6a7c2d9a11")).status).toBe(401);
  });

  it("cota com o subtotal da Geladeira da conta: R$ 90,00 e 5,2 km dão R$ 13,00", async () => {
    const id = await saveAddress();
    await putInFridge(4_500, 2);

    const response = await quote(id, tokens.customer());

    expect(response.status).toBe(200);
    expect(cotacaoDeFreteSchema.parse(response.body)).toEqual({
      naArea: true,
      freteCentavos: 1_300,
      gratis: false,
    });
  });

  it("subtotal de R$ 150,00 ou mais dá frete grátis", async () => {
    const id = await saveAddress();
    await putInFridge(5_000, 3);

    const response = await quote(id, tokens.customer());

    expect(cotacaoDeFreteSchema.parse(response.body)).toEqual({
      naArea: true,
      freteCentavos: 0,
      gratis: true,
    });
  });

  it("ignora um subtotal mandado na consulta", async () => {
    const id = await saveAddress();
    await putInFridge(4_500, 2);

    const response = await quote(id, tokens.customer()).query({ subtotalCentavos: 99_999 });

    expect(cotacaoDeFreteSchema.parse(response.body)).toMatchObject({ gratis: false });
  });

  it("endereço de outro cliente responde 404", async () => {
    const id = await saveAddress();
    await prisma.profile.create({ data: { id: tokens.adminId, email: "outro@leguele.test" } });

    const response = await quote(id, tokens.admin());

    expect(response.status).toBe(404);
  });

  it("id que não é UUID responde 400", async () => {
    expect((await quote("nao-e-uuid", tokens.customer())).status).toBe(400);
  });

  it("sem a configuração de entrega responde 503 DELIVERY_SETTINGS_MISSING", async () => {
    const id = await saveAddress();
    await prisma.deliverySettings.deleteMany();

    const response = await quote(id, tokens.customer());

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ code: "DELIVERY_SETTINGS_MISSING" });
  });
});
