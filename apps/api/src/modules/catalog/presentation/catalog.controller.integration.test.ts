import { catalogoResponseSchema } from "@leguele/shared";
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
});
