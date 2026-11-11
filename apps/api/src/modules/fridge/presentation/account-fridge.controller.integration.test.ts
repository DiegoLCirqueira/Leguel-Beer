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

describe("GET e PUT /me/geladeira (banco real)", () => {
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
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
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

  const get = (token?: string) =>
    request(app.getHttpServer())
      .get("/me/geladeira")
      .set(token ? { Authorization: `Bearer ${token}` } : {});

  it("devolve a Geladeira vazia para o cliente que nunca guardou nada", async () => {
    const response = await get(tokens.customer());

    expect(response.status).toBe(200);
    expect(geladeiraResponseSchema.parse(response.body)).toEqual({
      itens: [],
      ajustes: [],
      quantidadeTotal: 0,
      subtotalCentavos: 0,
    });
  });

  const put = (token: string | undefined, body: unknown) =>
    request(app.getHttpServer())
      .put("/me/geladeira")
      .set(token ? { Authorization: `Bearer ${token}` } : {})
      .send(body as object);

  const entry = (beer: { id: string }, quantidade = 1, precoVistoCentavos = 3200) => ({
    cervejaId: beer.id,
    quantidade,
    precoVistoCentavos,
  });

  it("PUT guarda a Geladeira na ordem de entrada e o GET devolve a mesma, com subtotal", async () => {
    const mareAlta = await addBeer("mare-alta", { name: "Maré Alta" });
    const cupuacu = await addBeer("cupuacu-ale", { name: "Cupuaçu Ale", priceCents: 2650 });

    const saved = await put(tokens.customer(), {
      itens: [entry(cupuacu, 1, 2650), entry(mareAlta, 2)],
    });
    const read = await get(tokens.customer());

    expect(saved.status).toBe(200);
    const body = geladeiraResponseSchema.parse(read.body);
    expect(body.itens.map((item) => [item.cerveja.nome, item.quantidade])).toEqual([
      ["Cupuaçu Ale", 1],
      ["Maré Alta", 2],
    ]);
    expect(body.quantidadeTotal).toBe(3);
    expect(body.subtotalCentavos).toBe(9050);
    expect(read.body).toEqual(saved.body);
  });

  it.each([
    ["sem token", undefined],
    ["com token adulterado", "token-invalido"],
  ])("recusa com 401 o GET e o PUT %s", async (_name, token) => {
    expect((await get(token)).status).toBe(401);
    expect((await put(token, { itens: [] })).status).toBe(401);
  });

  it("cada conta vê e altera só a própria Geladeira", async () => {
    await prisma.profile.create({ data: { id: tokens.adminId, email: "admin@leguele.test" } });
    const mareAlta = await addBeer("mare-alta", { name: "Maré Alta" });
    const cupuacu = await addBeer("cupuacu-ale", { name: "Cupuaçu Ale" });
    await put(tokens.customer(), { itens: [entry(mareAlta, 2)] });

    await put(tokens.admin(), { itens: [entry(cupuacu, 5)] });

    const cliente = geladeiraResponseSchema.parse((await get(tokens.customer())).body);
    const outra = geladeiraResponseSchema.parse((await get(tokens.admin())).body);
    expect(cliente.itens.map((i) => [i.cerveja.nome, i.quantidade])).toEqual([["Maré Alta", 2]]);
    expect(outra.itens.map((i) => [i.cerveja.nome, i.quantidade])).toEqual([["Cupuaçu Ale", 5]]);
  });

  it("repetir o PUT dá o mesmo resultado", async () => {
    const mareAlta = await addBeer("mare-alta", { priceCents: 3000, stock: 1 });
    const body = { itens: [entry(mareAlta, 3, 3200)] };

    const first = await put(tokens.customer(), body);
    const second = await put(tokens.customer(), body);

    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect((await get(tokens.customer())).body.itens).toEqual(first.body.itens);
    expect(await prisma.fridgeItem.count()).toBe(1);
  });

  it("o GET grava os ajustes: a cerveja desativada sai e o aviso aparece uma vez só", async () => {
    const mareAlta = await addBeer("mare-alta", { name: "Maré Alta" });
    const velha = await addBeer("velha", { name: "Velha" });
    await put(tokens.customer(), { itens: [entry(velha), entry(mareAlta, 2)] });
    await prisma.beer.update({ where: { id: velha.id }, data: { active: false } });
    await prisma.beer.update({ where: { id: mareAlta.id }, data: { priceCents: 3000 } });

    const first = geladeiraResponseSchema.parse((await get(tokens.customer())).body);
    const second = geladeiraResponseSchema.parse((await get(tokens.customer())).body);

    expect(first.ajustes.map((a) => [a.tipo, a.nome])).toEqual([
      ["indisponivel", "Velha"],
      ["preco-mudou", "Maré Alta"],
    ]);
    expect(first.itens.map((i) => i.cerveja.precoCentavos)).toEqual([3000]);
    expect(second.ajustes).toEqual([]);
    expect(second.itens).toEqual(first.itens);
  });

  it("aceita o id em maiúsculas e conta uma só vez a cerveja repetida com maiúsculas diferentes", async () => {
    const mareAlta = await addBeer("mare-alta", { name: "Maré Alta" });
    const id = mareAlta.id;

    const response = await put(tokens.customer(), {
      itens: [
        { cervejaId: id.toUpperCase(), quantidade: 2, precoVistoCentavos: 3200 },
        { cervejaId: id, quantidade: 4, precoVistoCentavos: 3200 },
      ],
    });

    expect(response.status).toBe(200);
    const body = geladeiraResponseSchema.parse(response.body);
    expect(body.itens.map((i) => [i.cerveja.id, i.quantidade])).toEqual([[id, 2]]);
    expect(body.ajustes).toEqual([]);
  });

  it("conta sem perfil recebe 409 no PUT e a Geladeira vazia no GET", async () => {
    await prisma.profile.delete({ where: { id: tokens.customerId } });
    const mareAlta = await addBeer("mare-alta");

    const saved = await put(tokens.customer(), { itens: [entry(mareAlta)] });

    expect(saved.status).toBe(409);
    expect(saved.body).toMatchObject({ code: "CONFLICT" });
    expect((await get(tokens.customer())).body.itens).toEqual([]);
    expect(await prisma.fridge.count()).toBe(0);
  });

  it("recusa com 400 o corpo fora do contrato, com o campo apontado", async () => {
    const mareAlta = await addBeer("mare-alta");

    const zero = await put(tokens.customer(), { itens: [entry(mareAlta, 0)] });
    const fracionaria = await put(tokens.customer(), { itens: [entry(mareAlta, 1.5)] });
    const muitos = await put(tokens.customer(), {
      itens: Array.from({ length: 51 }, (_, i) => ({
        cervejaId: `cerveja-${i}`,
        quantidade: 1,
        precoVistoCentavos: 100,
      })),
    });

    for (const response of [zero, fracionaria, muitos]) {
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ code: "VALIDATION_ERROR" });
      expect(response.body.details[0].field).toMatch(/^itens/);
    }
    expect(zero.body.details[0].field).toBe("itens.0.quantidade");
    expect(await prisma.fridge.count()).toBe(0);
  });

  it("PUTs e GETs simultâneos da mesma conta respondem todos 200 e a Geladeira fica com uma das versões", async () => {
    const mareAlta = await addBeer("mare-alta");
    const cupuacu = await addBeer("cupuacu-ale");
    const versions = [
      [entry(mareAlta, 2), entry(cupuacu, 1)],
      [entry(cupuacu, 4), entry(mareAlta, 3)],
      [entry(mareAlta, 5)],
    ];

    const responses = await Promise.all([
      ...versions.map((itens) => put(tokens.customer(), { itens })),
      get(tokens.customer()),
      get(tokens.customer()),
    ]);

    expect(responses.map((r) => r.status)).toEqual([200, 200, 200, 200, 200]);
    const final = geladeiraResponseSchema.parse((await get(tokens.customer())).body);
    expect(versions.map((itens) => itens.map((i) => [i.cervejaId, i.quantidade]))).toContainEqual(
      final.itens.map((i) => [i.cerveja.id, i.quantidade]),
    );
    expect(await prisma.fridge.count()).toBe(1);
  });
});
