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

  const validar = (body: unknown) => request(app.getHttpServer()).post("/geladeira/validar").send(body as object);

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
});
