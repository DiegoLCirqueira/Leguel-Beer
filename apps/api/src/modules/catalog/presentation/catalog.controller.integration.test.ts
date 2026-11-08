import { catalogoResponseSchema, destaquesResponseSchema } from "@leguele/shared";
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
import { CatalogModule } from "../catalog.module.js";

describe("GET /catalogo (banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;
  let categoryIds: Record<string, string>;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule, AccountModule, CatalogModule],
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
    categoryIds = {};
    for (const [slug, name, order] of [
      ["ipa", "IPAs", 1],
      ["frutas", "Frutas", 2],
      ["lager", "Lager", 4],
    ] as const) {
      categoryIds[slug] = (await prisma.category.create({ data: { slug, name, order } })).id;
    }
  });

  afterAll(() => app.close());

  const addBeer = (category: string, slug: string, overrides: object = {}) =>
    prisma.beer.create({
      data: {
        slug,
        name: slug,
        style: "American IPA",
        categoryId: categoryIds[category] as string,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 2800,
        stock: 10,
        ...overrides,
      },
    });

  const get = (query = "") => request(app.getHttpServer()).get(`/catalogo${query}`);
  const getDestaques = () => request(app.getHttpServer()).get("/catalogo/destaques");

  it("é público: sem token devolve as cervejas ativas no contrato, com a categoria e o contador", async () => {
    await addBeer("ipa", "ipa-aratu", {
      name: "IPA Aratu",
      abv: 6.5,
      ibu: 55,
      priceCents: 3200,
      stock: 12,
      featured: true,
      createdAt: new Date("2026-10-02T12:00:00Z"),
    });
    await addBeer("lager", "lager-sol", { name: "Lager Sol", stock: 0 });

    const response = await get();

    expect(response.status).toBe(200);
    const body = catalogoResponseSchema.parse(response.body);
    expect(body.total).toBe(2);
    expect(body.itens[0]).toEqual({
      id: expect.any(String),
      slug: "ipa-aratu",
      nome: "IPA Aratu",
      estilo: "American IPA",
      categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
      teorAlcoolico: 6.5,
      ibu: 55,
      volumeMl: 500,
      precoCentavos: 3200,
      destaque: true,
      quantidadeDisponivel: 12,
      esgotada: false,
      imagemUrl: null,
      cadastradaEm: "2026-10-02T12:00:00.000Z",
    });
    expect(body.itens[1]).toMatchObject({
      slug: "lager-sol",
      quantidadeDisponivel: 0,
      esgotada: true,
    });
    expect(body.categorias).toEqual([
      { slug: "ipa", nome: "IPAs", ordem: 1, quantidade: 1 },
      { slug: "lager", nome: "Lager", ordem: 4, quantidade: 1 },
    ]);
  });

  it("combina categoria, faixa de IBU e menor preço pela URL e conta o resultado", async () => {
    await addBeer("ipa", "a-ipa-cara", { ibu: 35, priceCents: 3300 });
    await addBeer("ipa", "ipa-barata", { ibu: 25, priceCents: 2700 });
    await addBeer("ipa", "ipa-amarga", { ibu: 60, priceCents: 2000 });
    await addBeer("lager", "lager-na-faixa", { ibu: 30, priceCents: 1900 });

    const response = await get("?categoria=ipa&ibu=20-a-40&ordem=menor-preco");

    const body = catalogoResponseSchema.parse(response.body);
    expect(body.itens.map((item) => item.slug)).toEqual(["ipa-barata", "a-ipa-cara"]);
    expect(body.total).toBe(2);
    expect(body.categorias.map((c) => [c.slug, c.quantidade])).toEqual([
      ["ipa", 3],
      ["lager", 1],
    ]);
  });

  it("nunca mostra cerveja inativa, nem filtrando pela categoria dela, e não a conta", async () => {
    await addBeer("ipa", "ipa-ativa");
    await addBeer("ipa", "ipa-inativa", { active: false });
    await addBeer("frutas", "frutas-inativa", { active: false });

    const todas = catalogoResponseSchema.parse((await get()).body);
    const frutas = catalogoResponseSchema.parse((await get("?categoria=frutas")).body);

    expect(todas.itens.map((item) => item.slug)).toEqual(["ipa-ativa"]);
    expect(todas.categorias).toEqual([{ slug: "ipa", nome: "IPAs", ordem: 1, quantidade: 1 }]);
    expect(frutas.itens.map((item) => item.slug)).toEqual(["ipa-ativa"]);
  });

  it("ignora parâmetro inválido em vez de rejeitar: abre o catálogo sem aquele filtro", async () => {
    await addBeer("ipa", "ipa-a");
    await addBeer("lager", "lager-b");

    const response = await get(
      "?categoria=stout&teor=faixa-que-nao-existe&ordem=mais-vendidos&disponiveis=talvez",
    );

    expect(response.status).toBe(200);
    expect(response.body.itens.map((item: { slug: string }) => item.slug)).toEqual([
      "ipa-a",
      "lager-b",
    ]);
  });

  it("esgotadas vão para o fim e 'só disponíveis' as esconde", async () => {
    await addBeer("ipa", "esgotada-barata", { priceCents: 1000, stock: 0 });
    await addBeer("ipa", "disponivel-cara", { priceCents: 4000 });

    const todas = await get("?ordem=menor-preco");
    const soDisponiveis = await get("?disponiveis=true");

    expect(todas.body.itens.map((item: { slug: string }) => item.slug)).toEqual([
      "disponivel-cara",
      "esgotada-barata",
    ]);
    expect(soDisponiveis.body.itens.map((item: { slug: string }) => item.slug)).toEqual([
      "disponivel-cara",
    ]);
  });

  it("parâmetro repetido na URL é inválido e ignorado: ?categoria=ipa&categoria=frutas não filtra", async () => {
    await addBeer("ipa", "ipa-a");
    await addBeer("frutas", "frutas-b");
    await addBeer("lager", "lager-c");

    const response = await get("?categoria=ipa&categoria=frutas");

    expect(response.status).toBe(200);
    expect(response.body.itens.map((item: { slug: string }) => item.slug)).toEqual([
      "ipa-a",
      "frutas-b",
      "lager-c",
    ]);
  });

  it("disponiveis=TRUE (fora de true ou false em minúsculas) é inválido e não esconde as esgotadas", async () => {
    await addBeer("ipa", "disponivel");
    await addBeer("ipa", "esgotada", { stock: 0 });

    const response = await get("?disponiveis=TRUE");

    expect(response.status).toBe(200);
    expect(response.body.itens.map((item: { slug: string }) => item.slug)).toEqual([
      "disponivel",
      "esgotada",
    ]);
  });

  it("GET /catalogo/destaques é público e devolve só os destaques ativos, no máximo 6, na ordem da spec", async () => {
    for (let index = 1; index <= 7; index += 1) {
      await addBeer("lager", `lager-destaque-${index}`, { featured: true });
    }
    await addBeer("ipa", "ipa-destaque", { featured: true });
    await addBeer("ipa", "ipa-inativa", { featured: true, active: false });
    await addBeer("ipa", "ipa-comum");

    const response = await getDestaques();

    expect(response.status).toBe(200);
    const body = destaquesResponseSchema.parse(response.body);
    expect(body.itens.map((item) => item.slug)).toEqual([
      "ipa-destaque",
      "lager-destaque-1",
      "lager-destaque-2",
      "lager-destaque-3",
      "lager-destaque-4",
      "lager-destaque-5",
    ]);
    expect(body.itens[0]).toMatchObject({ destaque: true, categoria: { slug: "ipa" } });
  });
});
