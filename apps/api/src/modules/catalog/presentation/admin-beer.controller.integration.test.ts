import { cervejaDoAdminSchema, listaDeCervejasDoAdminSchema } from "@leguele/shared";
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

const BODY = {
  nome: "Maré Alta",
  categoriaSlug: "ipa",
  estilo: "American IPA",
  precoCentavos: 3_900,
  volumeMl: 500,
  teorAlcoolico: 6.5,
  ibu: 60,
  estoqueInicial: 24,
  destaque: false,
  ativa: true,
};

const { estoqueInicial: _inicial, ...EDIT_BODY } = BODY;
void _inicial;

describe("/admin/cervejas (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;

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
    await prisma.profile.create({
      data: { id: tokens.adminId, email: "admin@leguele.test", role: "ADMIN" },
    });
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
    await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } });
  });

  afterAll(() => app.close());

  const send = (
    method: "get" | "post" | "put",
    path: string,
    options: { token?: string | null; body?: object } = {},
  ) => {
    const { token = tokens.admin(), body } = options;
    const req = request(app.getHttpServer())[method](path);
    if (token) req.set("Authorization", `Bearer ${token}`);
    return body ? req.send(body) : req;
  };

  it("sem token responde 401 e cliente comum 403, sem criar nada", async () => {
    expect((await send("post", "/admin/cervejas", { token: null, body: BODY })).status).toBe(401);
    expect(
      (await send("post", "/admin/cervejas", { token: tokens.customer(), body: BODY })).status,
    ).toBe(403);
    expect((await send("get", "/admin/cervejas", { token: tokens.customer() })).status).toBe(403);
    expect(await prisma.beer.count()).toBe(0);
  });

  it("cadastra a cerveja (201), lê pelo id e lista", async () => {
    const created = await send("post", "/admin/cervejas", { body: BODY });

    expect(created.status).toBe(201);
    const beer = cervejaDoAdminSchema.parse(created.body);
    expect(beer).toMatchObject({ slug: "mare-alta", estoqueFisico: 24, estoqueMinimo: 6 });
    expect(
      cervejaDoAdminSchema.parse((await send("get", `/admin/cervejas/${beer.id}`)).body).id,
    ).toBe(beer.id);
    expect(
      listaDeCervejasDoAdminSchema.parse(
        (await send("get", "/admin/cervejas?estado=inativas")).body,
      ).cervejas,
    ).toEqual([]);
  });

  it("corpo fora do contrato responde 400 VALIDATION_ERROR e não cria", async () => {
    const response = await send("post", "/admin/cervejas", {
      body: { ...BODY, precoCentavos: 5_000_000, slug: "x" },
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(await prisma.beer.count()).toBe(0);
  });

  it("a 5ª cerveja ativa da categoria responde 409 CATEGORY_FULL com o texto do card", async () => {
    for (let i = 0; i < 4; i += 1) {
      await send("post", "/admin/cervejas", { body: { ...BODY, nome: `Cerveja ${i}` } });
    }

    const response = await send("post", "/admin/cervejas", { body: { ...BODY, nome: "Quinta" } });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      code: "CATEGORY_FULL",
      detail: "A categoria IPA já tem 4 cervejas ativas. Desative uma antes.",
    });
  });

  it("nome repetido responde 409 BEER_NAME_TAKEN e categoria desconhecida 422 CATEGORY_NOT_FOUND", async () => {
    await send("post", "/admin/cervejas", { body: BODY });

    const repeated = await send("post", "/admin/cervejas", {
      body: { ...BODY, nome: "maré alta" },
    });
    const unknown = await send("post", "/admin/cervejas", {
      body: { ...BODY, nome: "Outra", categoriaSlug: "nao-existe" },
    });

    expect(repeated.status).toBe(409);
    expect(repeated.body).toMatchObject({ code: "BEER_NAME_TAKEN" });
    expect(unknown.status).toBe(422);
    expect(unknown.body).toMatchObject({ code: "CATEGORY_NOT_FOUND" });
  });

  it("edita (PUT) sem mudar slug nem estoque; id desconhecido responde 404; estoque inicial é recusado", async () => {
    const beer = cervejaDoAdminSchema.parse(
      (await send("post", "/admin/cervejas", { body: BODY })).body,
    );

    const edited = await send("put", `/admin/cervejas/${beer.id}`, {
      body: { ...EDIT_BODY, nome: "Maré Baixa", estoqueMinimo: 2 },
    });
    const missing = await send("put", `/admin/cervejas/${crypto.randomUUID()}`, {
      body: EDIT_BODY,
    });
    const withStock = await send("put", `/admin/cervejas/${beer.id}`, { body: BODY });

    expect(edited.status).toBe(200);
    expect(cervejaDoAdminSchema.parse(edited.body)).toMatchObject({
      slug: "mare-alta",
      nome: "Maré Baixa",
      estoqueFisico: 24,
      estoqueMinimo: 2,
    });
    expect(missing.status).toBe(404);
    expect(withStock.status).toBe(400);
  });

  it("id fora do formato responde 400 e id desconhecido na leitura, 404", async () => {
    expect((await send("get", "/admin/cervejas/abc")).status).toBe(400);
    expect((await send("get", `/admin/cervejas/${crypto.randomUUID()}`)).status).toBe(404);
  });
});
