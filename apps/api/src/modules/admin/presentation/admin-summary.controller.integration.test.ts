import { resumoDoAdminSchema } from "@leguele/shared";
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

describe("GET /admin/resumo (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  let app: INestApplication;
  let prisma: PrismaService;

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
  });

  afterAll(() => app.close());

  it("sem token responde 401 e cliente comum 403", async () => {
    expect((await request(app.getHttpServer()).get("/admin/resumo")).status).toBe(401);
    const customer = await request(app.getHttpServer())
      .get("/admin/resumo")
      .set("Authorization", `Bearer ${tokens.customer()}`);
    expect(customer.status).toBe(403);
    expect(customer.body).not.toHaveProperty("cervejasComEstoqueBaixo");
  });

  it("o admin recebe os dois contadores no contrato", async () => {
    const response = await request(app.getHttpServer())
      .get("/admin/resumo")
      .set("Authorization", `Bearer ${tokens.admin()}`);

    expect(response.status).toBe(200);
    expect(resumoDoAdminSchema.parse(response.body)).toEqual({
      cervejasComEstoqueBaixo: 0,
      pedidosPagosAguardandoPreparo: 0,
    });
  });
});
