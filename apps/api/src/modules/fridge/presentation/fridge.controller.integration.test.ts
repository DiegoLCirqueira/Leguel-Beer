import { geladeiraResponseSchema } from "@leguele/shared";
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
import { FridgeModule } from "../fridge.module.js";

describe("POST /geladeira/validar (banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryId: string;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule, AccountModule, FridgeModule],
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
    await resetDatabase(prisma);
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } }))
      .id;
  });

  afterAll(() => app.close());

  const addBeer = (slug: string, overrides: object = {}) =>
    prisma.beer.create({
      data: {
        slug,
        name: slug,
        style: "American IPA",
        categoryId,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3200,
        stock: 10,
        ...overrides,
      },
    });

  /** Reserva `quantity` unidades de um pedido aguardando pagamento ainda dentro da validade. */
  async function reserveUnits(beerId: string, quantity: number, number: string) {
    const profile = await prisma.profile.create({
      data: { id: crypto.randomUUID(), email: `${number}@x.test` },
    });
    const expiresAt = new Date(Date.now() + 20 * 60_000);
    const order = await prisma.order.create({
      data: {
        number,
        profileId: profile.id,
        paymentMethod: "PIX",
        subtotalCents: 100,
        shippingCents: 0,
        totalCents: 100,
        expiresAt,
        customerName: "Ana",
        customerPhone: "82999990000",
        shipZip: "57035000",
        shipStreet: "Rua do Sol",
        shipNumber: "1",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
      },
    });
    await prisma.stockReservation.create({
      data: { orderId: order.id, beerId, quantity, expiresAt },
    });
  }

  const validar = (body: unknown) =>
    request(app.getHttpServer())
      .post("/geladeira/validar")
      .send(body as object);

  it("é público: sem token devolve a Geladeira revalidada no contrato, com subtotal", async () => {
    const mareAlta = await addBeer("mare-alta", { name: "Maré Alta", priceCents: 3200 });
    const cupuacu = await addBeer("cupuacu-ale", { name: "Cupuaçu Ale", priceCents: 2650 });

    const response = await validar({
      itens: [
        { cervejaId: mareAlta.id, quantidade: 2, precoVistoCentavos: 3200 },
        { cervejaId: cupuacu.id, quantidade: 1, precoVistoCentavos: 2650 },
      ],
    });

    expect(response.status).toBe(200);
    const body = geladeiraResponseSchema.parse(response.body);
    expect(body.itens.map((item) => [item.cerveja.nome, item.quantidade])).toEqual([
      ["Maré Alta", 2],
      ["Cupuaçu Ale", 1],
    ]);
    expect(body.ajustes).toEqual([]);
    expect(body.quantidadeTotal).toBe(3);
    expect(body.subtotalCentavos).toBe(9050);
  });

  it("desconta as reservas: reduz a quantidade ao que sobra e tira a cerveja toda reservada", async () => {
    const parcial = await addBeer("parcial", { name: "Parcial", stock: 5 });
    const total = await addBeer("total", { name: "Total", stock: 2 });
    await reserveUnits(parcial.id, 3, "#LB200002");
    await reserveUnits(total.id, 2, "#LB200003");

    const response = await validar({
      itens: [
        { cervejaId: parcial.id, quantidade: 4, precoVistoCentavos: 3200 },
        { cervejaId: total.id, quantidade: 1, precoVistoCentavos: 3200 },
      ],
    });

    const body = geladeiraResponseSchema.parse(response.body);
    expect(body.itens.map((item) => [item.cerveja.nome, item.quantidade])).toEqual([
      ["Parcial", 2],
    ]);
    expect(body.ajustes.map((ajuste) => ajuste.tipo).sort()).toEqual([
      "indisponivel",
      "quantidade-reduzida",
    ]);
  });

  it("id que não é UUID ou que não existe vira ajuste indisponível sem nome, nunca erro 500", async () => {
    const mareAlta = await addBeer("mare-alta", { name: "Maré Alta" });

    const response = await validar({
      itens: [
        { cervejaId: "nao-sou-uuid", quantidade: 1, precoVistoCentavos: 3200 },
        { cervejaId: "00000000-0000-4000-8000-000000000000", quantidade: 1, precoVistoCentavos: 1 },
        { cervejaId: mareAlta.id, quantidade: 1, precoVistoCentavos: 3200 },
      ],
    });

    expect(response.status).toBe(200);
    const body = geladeiraResponseSchema.parse(response.body);
    expect(body.ajustes).toEqual([
      { tipo: "indisponivel", cervejaId: "nao-sou-uuid", nome: null },
      { tipo: "indisponivel", cervejaId: "00000000-0000-4000-8000-000000000000", nome: null },
    ]);
    expect(body.itens.map((item) => item.cerveja.nome)).toEqual(["Maré Alta"]);
  });

  it("devolve os ajustes de cerveja desativada, esgotada, preço e quantidade", async () => {
    const desativada = await addBeer("a", { name: "Desativada", active: false });
    const esgotada = await addBeer("b", { name: "Esgotada", stock: 0 });
    const barata = await addBeer("c", { name: "Barata", priceCents: 3000 });
    const poucas = await addBeer("d", { name: "Poucas", stock: 1 });

    const response = await validar({
      itens: [poucas, barata, esgotada, desativada].map((beer) => ({
        cervejaId: beer.id,
        quantidade: 2,
        precoVistoCentavos: 3200,
      })),
    });

    const body = geladeiraResponseSchema.parse(response.body);
    expect(body.ajustes.map((ajuste) => [ajuste.tipo, ajuste.nome])).toEqual([
      ["quantidade-reduzida", "Poucas"],
      ["preco-mudou", "Barata"],
      ["indisponivel", "Esgotada"],
      ["indisponivel", "Desativada"],
    ]);
    expect(
      body.itens.map((item) => [item.cerveja.nome, item.quantidade, item.totalCentavos]),
    ).toEqual([
      ["Poucas", 1, 3200],
      ["Barata", 2, 6000],
    ]);
  });

  it("recusa com 400 a quantidade fora de 1 a 99 e a cerveja repetida", async () => {
    const mareAlta = await addBeer("mare-alta");
    const item = { cervejaId: mareAlta.id, quantidade: 1, precoVistoCentavos: 3200 };

    expect((await validar({ itens: [{ ...item, quantidade: 100 }] })).status).toBe(400);
    expect((await validar({ itens: [item, item] })).status).toBe(400);
    expect((await validar({})).status).toBe(400);
  });

  it("recusa com 400 a quantidade 0, a fracionária e 51 itens, com o corpo do erro e o campo", async () => {
    const mareAlta = await addBeer("mare-alta");
    const item = { cervejaId: mareAlta.id, quantidade: 1, precoVistoCentavos: 3200 };

    const zero = await validar({ itens: [{ ...item, quantidade: 0 }] });
    const fracionaria = await validar({ itens: [{ ...item, quantidade: 1.5 }] });
    const muitos = await validar({
      itens: Array.from({ length: 51 }, (_, i) => ({ ...item, cervejaId: `cerveja-${i}` })),
    });

    for (const response of [zero, fracionaria, muitos]) {
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "VALIDATION_ERROR" });
      expect(response.body.details[0].field).toMatch(/^itens/);
    }
    expect(zero.body.details[0].field).toBe("itens.0.quantidade");
    expect(fracionaria.body.details[0].field).toBe("itens.0.quantidade");
  });

  it("aceita o id em maiúsculas e devolve o id da cerveja em minúsculas", async () => {
    const mareAlta = await addBeer("mare-alta", { name: "Maré Alta" });

    const response = await validar({
      itens: [{ cervejaId: mareAlta.id.toUpperCase(), quantidade: 1, precoVistoCentavos: 3200 }],
    });

    const body = geladeiraResponseSchema.parse(response.body);
    expect(body.ajustes).toEqual([]);
    expect(body.itens.map((i) => i.cerveja.id)).toEqual([mareAlta.id]);
  });

  it("não grava nada: nem Geladeira nova nem mudança na que a conta já tem", async () => {
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
    const mareAlta = await addBeer("mare-alta");
    const antes = await prisma.fridge.create({
      data: {
        profileId: tokens.customerId,
        items: {
          create: [{ beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200, position: 0 }],
        },
      },
      include: { items: true },
    });

    await validar({ itens: [{ cervejaId: mareAlta.id, quantidade: 9, precoVistoCentavos: 1 }] });

    expect(await prisma.fridge.count()).toBe(1);
    const depois = await prisma.fridge.findUniqueOrThrow({
      where: { id: antes.id },
      include: { items: true },
    });
    expect(depois).toEqual(antes);
  });
});
