import { papelResponseSchema } from "@leguele/shared";
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
import { PrismaProfileRepository } from "../infrastructure/prisma-profile-repository.js";

describe("GET /me/role (banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;
  let profiles: PrismaProfileRepository;

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
    profiles = new PrismaProfileRepository(prisma);
  });

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => app.close());

  const get = (token?: string) =>
    request(app.getHttpServer())
      .get("/me/role")
      .set(token ? { Authorization: `Bearer ${token}` } : {});

  it("conta sem perfil nenhum é cliente", async () => {
    const response = await get(tokens.customer());

    expect(response.status).toBe(200);
    expect(papelResponseSchema.parse(response.body)).toEqual({ papel: "cliente" });
  });

  it("o admin do seed, com perfil incompleto (só o papel), é admin", async () => {
    await profiles.ensureRole({ id: tokens.adminId, email: "admin@leguele.test" }, "admin");

    const response = await get(tokens.admin());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ papel: "admin" });
  });

  it("cliente com perfil completo é cliente", async () => {
    await profiles.createProfile({
      id: tokens.customerId,
      email: "cliente@leguele.test",
      nome: "Ana Souza",
      telefone: "82912345678",
      role: "customer",
      aceite: {
        termosVersao: "2026-10-30",
        privacidadeVersao: "2026-10-30",
        aceitoEm: new Date("2026-10-30T12:00:00.000Z"),
      },
    });

    const response = await get(tokens.customer());

    expect(response.body).toEqual({ papel: "cliente" });
  });

  it("sem token ou com token inválido responde 401 UNAUTHORIZED", async () => {
    const semToken = await get();
    const adulterado = await get(tokens.tampered());

    expect(semToken.status).toBe(401);
    expect(semToken.body.code).toBe("UNAUTHORIZED");
    expect(adulterado.status).toBe(401);
  });
});
