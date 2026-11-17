import { erroDoPedidoSchema, geladeiraResponseSchema, pedidoCriadoSchema } from "@leguele/shared";
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
import { GEOCODER, ROUTE_CALCULATOR } from "../../delivery/delivery.tokens.js";
import { DeliveryModule } from "../../delivery/delivery.module.js";
import { seedDeliverySettings } from "../../delivery/infrastructure/seed-delivery-settings.js";
import { FakeGeocoder, FakeRouteCalculator } from "../../delivery/testing/fake-maps.js";
import { FridgeModule } from "../../fridge/fridge.module.js";
import { OrderModule } from "../order.module.js";

const CHAVE = "chave-de-idempotencia-0001";

describe("POST /me/pedidos (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  const geocoder = new FakeGeocoder();
  const router = new FakeRouteCalculator();
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryId: string;
  let addressId: string;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [
        CommonModule,
        PrismaModule,
        AccountModule,
        FridgeModule,
        DeliveryModule,
        OrderModule,
      ],
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
    app.select(OrderModule).get(AccountRateLimiter).reset();
    geocoder.respondWith({ latitude: -9.66, longitude: -35.74 });
    router.respondWith(5_200);
    await seedDeliverySettings(prisma);
    await prisma.profile.create({
      data: {
        id: tokens.customerId,
        email: "cliente@leguele.test",
        nome: "Ana Souza",
        telefone: "82912345678",
        birthDate: new Date("1990-01-01T00:00:00.000Z"),
        termsVersion: "2026-10-30",
        privacyVersion: "2026-10-30",
        termsAcceptedAt: new Date("2026-10-30T12:00:00.000Z"),
      },
    });
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } }))
      .id;
    // O endereço entra direto no banco, já com distância e origem da rota, como a API o grava.
    addressId = (
      await prisma.address.create({
        data: {
          profileId: tokens.customerId,
          zip: "57035000",
          street: "Rua do Sol",
          number: "100",
          district: "Farol",
          city: "Maceió",
          state: "AL",
          isDefault: true,
          latitude: -9.66,
          longitude: -35.74,
          distanceMeters: 5_200,
          routeOriginLatitude: -9.6649,
          routeOriginLongitude: -35.7313,
        },
      })
    ).id;
  });

  afterAll(() => app.close());

  async function fillFridge(priceCents: number, quantity: number, stock = 100, seen = priceCents) {
    const beer = await prisma.beer.create({
      data: {
        slug: `ipa-${priceCents}-${quantity}`,
        name: "Maré Alta",
        style: "American IPA",
        categoryId,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents,
        stock,
      },
    });
    await prisma.fridge.create({
      data: {
        profileId: tokens.customerId,
        items: { create: [{ beerId: beer.id, quantity, seenPriceCents: seen, position: 0 }] },
      },
    });
    return beer;
  }

  const body = (totalVistoCentavos: number, extra: object = {}) => ({
    enderecoId: addressId,
    pagamento: { tipo: "pix" },
    totalVistoCentavos,
    ...extra,
  });

  const post = (payload: unknown, options: { key?: string | null; token?: string | null } = {}) => {
    const { key = CHAVE, token = tokens.customer() } = options;
    const req = request(app.getHttpServer()).post("/me/pedidos");
    if (token) req.set("Authorization", `Bearer ${token}`);
    if (key) req.set("Idempotency-Key", key);
    return req.send(payload as object);
  };

  it("sem token responde 401", async () => {
    expect((await post(body(1), { token: null })).status).toBe(401);
  });

  it("sem o cabeçalho Idempotency-Key, ou com chave fora do formato, responde 400", async () => {
    await fillFridge(4_500, 2);

    expect((await post(body(10_300), { key: null })).status).toBe(400);
    expect((await post(body(10_300), { key: "curta" })).status).toBe(400);
    expect(await prisma.order.count()).toBe(0);
  });

  it("corpo fora do contrato responde 400 VALIDATION_ERROR", async () => {
    const response = await post({ enderecoId: addressId, pagamento: { tipo: "boleto" } });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("cria o pedido com a Geladeira da conta: itens, preço e frete vêm do servidor, não do corpo", async () => {
    const beer = await fillFridge(4_500, 2);

    const response = await post(
      body(10_300, {
        itens: [{ cervejaId: "x", quantidade: 99, precoCentavos: 1 }],
        freteCentavos: 0,
        subtotalCentavos: 1,
      }),
    );

    expect(response.status).toBe(201);
    expect(pedidoCriadoSchema.parse(response.body)).toMatchObject({
      status: "aguardando-pagamento",
      itens: [{ cervejaId: beer.id, nome: "Maré Alta", precoCentavos: 4_500, quantidade: 2 }],
      subtotalCentavos: 9_000,
      freteCentavos: 1_300,
      totalCentavos: 10_300,
    });
    expect(await prisma.stockReservation.count()).toBe(1);
  });

  it("a mesma chave e o mesmo corpo repetem status e corpo; outro corpo com a mesma chave responde 422", async () => {
    await fillFridge(4_500, 2);
    const first = await post(body(10_300));

    const replay = await post(body(10_300));
    const reused = await post(body(10_300, { pagamento: { tipo: "cartao", parcelas: 2 } }));

    expect(replay.status).toBe(201);
    expect(replay.body).toEqual(first.body);
    expect(reused.status).toBe(422);
    expect(erroDoPedidoSchema.parse(reused.body)).toMatchObject({ code: "IDEMPOTENCY_KEY_REUSED" });
    expect(await prisma.order.count()).toBe(1);
  });

  it("total diferente do visto responde 409 TOTAL_CHANGED com o total novo e os ajustes, e grava o ajuste na Geladeira", async () => {
    await fillFridge(5_000, 2, 100, 4_500);

    const response = await post(body(10_300));

    expect(response.status).toBe(409);
    expect(erroDoPedidoSchema.parse(response.body)).toMatchObject({
      code: "TOTAL_CHANGED",
      totalAtualCentavos: 11_300,
      ajustes: [{ tipo: "preco-mudou", precoVistoCentavos: 4_500, precoAtualCentavos: 5_000 }],
    });
    expect(await prisma.order.count()).toBe(0);
    expect(await prisma.idempotencyKey.count()).toBe(0);
    const fridge = await request(app.getHttpServer())
      .get("/me/geladeira")
      .set({ Authorization: `Bearer ${tokens.customer()}` });
    expect(geladeiraResponseSchema.parse(fridge.body).ajustes).toEqual([]);
  });

  it("reserva de outro pedido reduz o disponível: responde 409 TOTAL_CHANGED com a quantidade reduzida", async () => {
    const beer = await fillFridge(4_500, 2, 5);
    const reserver = await prisma.profile.create({
      data: { id: crypto.randomUUID(), email: "reservou@leguele.test", nome: "R" },
    });
    await prisma.order.create({
      data: {
        number: "#LB000009",
        profileId: reserver.id,
        paymentMethod: "PIX",
        subtotalCents: 1,
        shippingCents: 0,
        totalCents: 1,
        expiresAt: new Date(Date.now() + 10 * 60_000),
        customerName: "R",
        customerPhone: "1",
        shipZip: "1",
        shipStreet: "1",
        shipNumber: "1",
        shipDistrict: "1",
        shipCity: "1",
        shipState: "AL",
        reservations: {
          create: [{ beerId: beer.id, quantity: 4, expiresAt: new Date(Date.now() + 10 * 60_000) }],
        },
      },
    });

    const response = await post(body(10_300));

    // A Geladeira revalidada já enxerga só 1 unidade disponível, então o total muda antes da trava.
    expect(response.status).toBe(409);
    expect(erroDoPedidoSchema.parse(response.body)).toMatchObject({
      code: "TOTAL_CHANGED",
      totalAtualCentavos: 5_800,
      ajustes: [{ tipo: "quantidade-reduzida", quantidadeAnterior: 2, quantidadeAtual: 1 }],
    });
    expect(await prisma.order.count({ where: { profileId: tokens.customerId } })).toBe(0);
  });

  it("com pedido aguardando pagamento dentro da validade responde 409 PENDING_ORDER com o id dele", async () => {
    await fillFridge(4_500, 2);
    const first = await post(body(10_300));

    const second = await post(body(10_300), { key: "outra-chave-de-idempotencia" });

    expect(second.status).toBe(409);
    expect(erroDoPedidoSchema.parse(second.body)).toMatchObject({
      code: "PENDING_ORDER",
      pedidoId: (first.body as { id: string }).id,
    });
  });

  it("menor de 18 anos responde 422 UNDERAGE e sem data de nascimento 422 BIRTH_DATE_REQUIRED", async () => {
    await fillFridge(4_500, 2);
    await prisma.profile.update({
      where: { id: tokens.customerId },
      data: { birthDate: new Date("2020-01-01T00:00:00.000Z") },
    });
    const underage = await post(body(10_300));
    await prisma.profile.update({ where: { id: tokens.customerId }, data: { birthDate: null } });
    const missing = await post(body(10_300));

    expect(underage.status).toBe(422);
    expect(erroDoPedidoSchema.parse(underage.body)).toMatchObject({
      code: "UNDERAGE",
      message: "Venda proibida para menores de 18 anos.",
    });
    expect(missing.status).toBe(422);
    expect(erroDoPedidoSchema.parse(missing.body)).toMatchObject({ code: "BIRTH_DATE_REQUIRED" });
    expect(await prisma.order.count()).toBe(0);
  });

  it("endereço fora da área responde 422 OUT_OF_DELIVERY_AREA e de outro cliente 404", async () => {
    await fillFridge(4_500, 2);
    await prisma.address.update({ where: { id: addressId }, data: { distanceMeters: null } });
    const outside = await post(body(10_300));
    const foreign = await post({ ...body(10_300), enderecoId: crypto.randomUUID() });

    expect(outside.status).toBe(422);
    expect(erroDoPedidoSchema.parse(outside.body)).toMatchObject({ code: "OUT_OF_DELIVERY_AREA" });
    expect(foreign.status).toBe(404);
  });

  it("Geladeira vazia responde 422 EMPTY_FRIDGE", async () => {
    const response = await post(body(10_300));

    expect(response.status).toBe(422);
    expect(erroDoPedidoSchema.parse(response.body)).toMatchObject({ code: "EMPTY_FRIDGE" });
  });

  it("sem a configuração de entrega responde 503 DELIVERY_SETTINGS_MISSING, sem stack, e não cria nada", async () => {
    await fillFridge(4_500, 2);
    await prisma.deliverySettings.deleteMany();

    const response = await post(body(10_300));

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ code: "DELIVERY_SETTINGS_MISSING" });
    expect(JSON.stringify(response.body)).not.toContain("stack");
    expect(await prisma.order.count()).toBe(0);
  });

  it("a 11ª criação do minuto responde 429", async () => {
    for (let i = 0; i < 10; i++) await post(body(10_300), { key: `chave-de-idempotencia-${i}00` });

    const response = await post(body(10_300), { key: "chave-de-idempotencia-9999" });

    expect(response.status).toBe(429);
  });
});
