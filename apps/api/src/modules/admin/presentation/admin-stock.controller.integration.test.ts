import {
  historicoDoEstoqueSchema,
  listaDoEstoqueSchema,
  movimentoDeEstoqueSchema,
} from "@leguele/shared";
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
import { AdminModule } from "../admin.module.js";

describe("/admin/estoque (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;
  let beerId: string;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule, AccountModule, AdminModule],
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
    const category = await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } });
    beerId = (
      await prisma.beer.create({
        data: {
          slug: "mare-alta",
          name: "Maré Alta",
          style: "IPA",
          categoryId: category.id,
          abv: 5,
          ibu: 30,
          volumeMl: 500,
          priceCents: 3000,
          stock: 10,
        },
      })
    ).id;
  });

  afterAll(() => app.close());

  const send = (
    method: "get" | "post",
    path: string,
    options: { token?: string | null; body?: object } = {},
  ) => {
    const { token = tokens.admin(), body } = options;
    const req = request(app.getHttpServer())[method](path);
    if (token) req.set("Authorization", `Bearer ${token}`);
    return body ? req.send(body) : req;
  };

  it("sem token responde 401 e cliente comum 403, sem mexer no estoque", async () => {
    const body = { tipo: "entrada", quantidade: 5 };

    expect((await send("get", "/admin/estoque", { token: null })).status).toBe(401);
    expect((await send("get", "/admin/estoque", { token: tokens.customer() })).status).toBe(403);
    expect(
      (await send("post", `/admin/estoque/${beerId}/ajustes`, { token: tokens.customer(), body }))
        .status,
    ).toBe(403);
    expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).stock).toBe(10);
  });

  it("lista o estoque no contrato, com o selo Baixo", async () => {
    const response = await send("get", "/admin/estoque");

    expect(response.status).toBe(200);
    expect(listaDoEstoqueSchema.parse(response.body).itens).toMatchObject([
      { nome: "Maré Alta", fisico: 10, reservado: 0, disponivel: 10, minimo: 6, baixo: false },
    ]);
  });

  it("ajusta o estoque (201), com motivo padrão na entrada, e o histórico mostra o movimento", async () => {
    const created = await send("post", `/admin/estoque/${beerId}/ajustes`, {
      body: { tipo: "entrada", quantidade: 5 },
    });

    expect(created.status).toBe(201);
    expect(movimentoDeEstoqueSchema.parse(created.body)).toMatchObject({
      tipo: "entrada",
      quantidade: 5,
      motivo: "Produção",
      saldoFisico: 15,
    });
    const history = historicoDoEstoqueSchema.parse(
      (await send("get", `/admin/estoque/${beerId}/movimentos`)).body,
    );
    expect(history.movimentos).toHaveLength(1);
  });

  it("recusa físico negativo e abaixo do reservado com 422 e o texto da spec", async () => {
    const negative = await send("post", `/admin/estoque/${beerId}/ajustes`, {
      body: { tipo: "perda", quantidade: 11, motivo: "Quebra" },
    });
    await prisma.order.create({
      data: {
        number: "#LB000001",
        profileId: tokens.customerId,
        paymentMethod: "PIX",
        subtotalCents: 1,
        shippingCents: 0,
        totalCents: 1,
        expiresAt: new Date(Date.now() + 600_000),
        customerName: "Ana",
        customerPhone: "82999990000",
        shipZip: "57035000",
        shipStreet: "Rua",
        shipNumber: "1",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
        reservations: {
          create: { beerId, quantity: 6, expiresAt: new Date(Date.now() + 600_000) },
        },
      },
    });
    const below = await send("post", `/admin/estoque/${beerId}/ajustes`, {
      body: { tipo: "perda", quantidade: 5, motivo: "Quebra" },
    });

    expect(negative.status).toBe(422);
    expect(negative.body).toMatchObject({
      code: "STOCK_NEGATIVE",
      message: "O estoque físico não pode ficar negativo.",
    });
    expect(below.status).toBe(422);
    expect(below.body).toMatchObject({
      code: "STOCK_BELOW_RESERVED",
      message: "O estoque físico não pode ficar abaixo das 6 unidades reservadas.",
    });
    expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).stock).toBe(10);
  });

  it("corpo fora do contrato responde 400, id fora do formato 400 e cerveja desconhecida 404", async () => {
    expect(
      (
        await send("post", `/admin/estoque/${beerId}/ajustes`, {
          body: { tipo: "perda", quantidade: 1 },
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await send("post", `/admin/estoque/${beerId}/ajustes`, {
          body: { tipo: "entrada", quantidade: 100_001 },
        })
      ).status,
    ).toBe(400);
    expect((await send("get", "/admin/estoque/abc/movimentos")).status).toBe(400);
    const missing = crypto.randomUUID();
    expect((await send("get", `/admin/estoque/${missing}/movimentos`)).status).toBe(404);
    expect(
      (
        await send("post", `/admin/estoque/${missing}/ajustes`, {
          body: { tipo: "entrada", quantidade: 1 },
        })
      ).status,
    ).toBe(404);
  });
});
