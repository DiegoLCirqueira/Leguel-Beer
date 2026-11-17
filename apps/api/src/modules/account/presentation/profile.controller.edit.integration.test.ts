import { perfilResponseSchema } from "@leguele/shared";
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
import { AccountModule } from "../account.module.js";
import { TOKEN_VERIFIER } from "../account.tokens.js";
import { JwksTokenVerifier } from "../infrastructure/jwks-token-verifier.js";

const edicao = {
  nome: "Ana Maria Souza",
  telefone: "(82) 99876-5432",
  dataNascimento: "15/03/1992",
};

describe("PUT /me/profile (banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule, AccountModule],
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
      data: {
        id: tokens.customerId,
        email: "cliente@leguele.test",
        nome: "Ana Souza",
        telefone: "82912345678",
        termsVersion: "2026-10-30",
        privacyVersion: "2026-10-30",
        termsAcceptedAt: new Date("2026-10-30T12:00:00.000Z"),
      },
    });
  });

  afterAll(() => app.close());

  const put = (body: unknown, token?: string) =>
    request(app.getHttpServer())
      .put("/me/profile")
      .set(token ? { Authorization: `Bearer ${token}` } : {})
      .send(body as object);

  const get = (token: string) =>
    request(app.getHttpServer()).get("/me/profile").set({ Authorization: `Bearer ${token}` });

  it("sem token responde 401", async () => {
    expect((await put(edicao)).status).toBe(401);
  });

  it("salva os dados e o GET devolve o mesmo, com a data em AAAA-MM-DD", async () => {
    const saved = await put(edicao, tokens.customer());
    const read = await get(tokens.customer());

    expect(saved.status).toBe(200);
    expect(perfilResponseSchema.parse(saved.body)).toMatchObject({
      nome: "Ana Maria Souza",
      telefone: "82998765432",
      dataNascimento: "1992-03-15",
      email: "cliente@leguele.test",
    });
    expect(read.body).toEqual(saved.body);
  });

  it("dado inválido responde 400 VALIDATION_ERROR com o campo e não grava nada", async () => {
    const response = await put({ ...edicao, dataNascimento: "31/04/1990" }, tokens.customer());

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: "VALIDATION_ERROR",
      details: [expect.objectContaining({ field: "dataNascimento" })],
    });
    expect(
      await prisma.profile.findUniqueOrThrow({ where: { id: tokens.customerId } }),
    ).toMatchObject({ nome: "Ana Souza", birthDate: null });
  });

  it("recusa e-mail, id, papel e aceite no corpo e não muda nada de outro perfil", async () => {
    const outro = crypto.randomUUID();
    await prisma.profile.create({
      data: { id: outro, email: "outro@leguele.test", nome: "Outro" },
    });

    const response = await put(
      { ...edicao, email: "x@y.com", id: outro, papel: "admin" },
      tokens.customer(),
    );

    expect(response.status).toBe(400);
    expect(await prisma.profile.findUniqueOrThrow({ where: { id: outro } })).toMatchObject({
      nome: "Outro",
      birthDate: null,
    });
    expect(
      await prisma.profile.findUniqueOrThrow({ where: { id: tokens.customerId } }),
    ).toMatchObject({ role: "CUSTOMER", email: "cliente@leguele.test" });
  });

  it("conta sem perfil completo responde 404", async () => {
    await prisma.profile.update({
      where: { id: tokens.customerId },
      data: {
        nome: null,
        telefone: null,
        termsVersion: null,
        privacyVersion: null,
        termsAcceptedAt: null,
      },
    });

    expect((await put(edicao, tokens.customer())).status).toBe(404);
  });
});
