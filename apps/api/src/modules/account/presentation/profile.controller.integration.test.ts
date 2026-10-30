import type { INestApplication } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { perfilResponseSchema } from "@leguele/shared";
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

const valido = { nome: "Ana Souza", telefone: "(82) 91234-5678", aceite: true };

describe("POST e GET /me/profile (banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env["ADMIN_EMAIL"] = "admin@leguele.test";
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
    await prisma.$executeRaw`DELETE FROM auth.users`;
  });
  afterAll(() => app.close());

  const post = (token: string | undefined, body: unknown) =>
    request(app.getHttpServer())
      .post("/me/profile")
      .set(token ? { Authorization: `Bearer ${token}` } : {})
      .send(body as object);
  const get = (token?: string) =>
    request(app.getHttpServer())
      .get("/me/profile")
      .set(token ? { Authorization: `Bearer ${token}` } : {});

  it("cria o perfil na primeira chamada: 201 com o contrato compartilhado", async () => {
    const response = await post(tokens.customer(), valido);

    expect(response.status).toBe(201);
    const perfil = perfilResponseSchema.parse(response.body);
    expect(perfil).toMatchObject({
      id: tokens.customerId,
      email: "cliente@leguele.test",
      nome: "Ana Souza",
      telefone: "82912345678",
      papel: "cliente",
      aceite: { termosVersao: "2026-10-30", privacidadeVersao: "2026-10-30" },
    });
    expect(Math.abs(Date.now() - Date.parse(perfil.aceite.aceitoEm))).toBeLessThan(10_000);
  });

  it("repetir responde 200 com o perfil existente, sem alterar nada", async () => {
    const first = await post(tokens.customer(), valido);

    const second = await post(tokens.customer(), { ...valido, nome: "Outro Nome" });

    expect(second.status).toBe(200);
    expect(second.body).toEqual(first.body);
  });

  it("duas chamadas simultâneas criam um perfil só: um 201 e um 200", async () => {
    const responses = await Promise.all([
      post(tokens.customer(), valido),
      post(tokens.customer(), valido),
    ]);

    expect(responses.map((r) => r.status).sort()).toEqual([200, 201]);
    expect(await prisma.profile.count()).toBe(1);
  });

  it("grava o papel admin para o e-mail do ADMIN_EMAIL com e-mail confirmado em auth.users", async () => {
    await prisma.$executeRaw`INSERT INTO auth.users (id, email, email_confirmed_at) VALUES (${tokens.adminId}::uuid, 'admin@leguele.test', now())`;

    const response = await post(tokens.admin(), valido);

    expect(response.status).toBe(201);
    expect(response.body.papel).toBe("admin");
  });

  it("o e-mail do admin com email_confirmed_at nulo em auth.users vira cliente, mesmo com user_metadata dizendo o contrário", async () => {
    await prisma.$executeRaw`INSERT INTO auth.users (id, email, email_confirmed_at) VALUES (${tokens.adminId}::uuid, 'admin@leguele.test', NULL)`;
    const forjado = tokens.custom({
      sub: tokens.adminId,
      email: "admin@leguele.test",
      user_metadata: { email_verified: true },
    });

    const response = await post(forjado, valido);

    expect(response.status).toBe(201);
    expect(response.body.papel).toBe("cliente");
  });

  it("recusa com 401 o token sem e-mail, sem criar perfil", async () => {
    const semEmail = tokens.custom({ email: undefined });

    const criar = await post(semEmail, valido);
    const ler = await get(semEmail);

    expect(criar.status).toBe(401);
    expect(ler.status).toBe(401);
    expect(await prisma.profile.count()).toBe(0);
  });

  it.each([
    ["telefone inválido", { ...valido, telefone: "(82) 1234" }, "telefone"],
    ["aceite falso", { ...valido, aceite: false }, "aceite"],
    ["nome vazio", { ...valido, nome: "" }, "nome"],
  ])("responde 400 VALIDATION_ERROR com o campo em details: %s", async (_caso, corpo, campo) => {
    const response = await post(tokens.customer(), corpo);

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(response.body.details).toContainEqual(expect.objectContaining({ field: campo }));
    expect(await prisma.profile.count()).toBe(0);
  });

  it("recusa e-mail, id e papel no corpo: vêm do token", async () => {
    const response = await post(tokens.customer(), { ...valido, email: "x@y.com", papel: "admin" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });

  it("sem token, POST e GET respondem 401 UNAUTHORIZED", async () => {
    const criar = await post(undefined, valido);
    const ler = await get();

    expect(criar.status).toBe(401);
    expect(ler.status).toBe(401);
    expect(ler.body.code).toBe("UNAUTHORIZED");
  });

  it("GET responde 404 NOT_FOUND sem perfil e 200 com o próprio perfil depois de criado", async () => {
    const antes = await get(tokens.customer());
    await post(tokens.customer(), valido);
    const depois = await get(tokens.customer());
    const doAdmin = await get(tokens.admin());

    expect(antes.status).toBe(404);
    expect(antes.body.code).toBe("NOT_FOUND");
    expect(depois.status).toBe(200);
    expect(perfilResponseSchema.parse(depois.body).id).toBe(tokens.customerId);
    expect(doAdmin.status).toBe(404);
  });
});
