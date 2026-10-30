import { Controller, Get, Param, type INestApplication } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ownedOrNotFound } from "../../../common/authorization/owned-or-not-found.js";
import { CommonModule } from "../../../common/common.module.js";
import { AllExceptionsFilter } from "../../../common/http/all-exceptions.filter.js";
import { createTestTokens } from "../../../common/testing/tokens.js";
import { JwksTokenVerifier } from "../infrastructure/jwks-token-verifier.js";
import { InMemoryProfileRepository } from "../testing/in-memory.js";
import { AccountModule } from "../account.module.js";
import { PROFILE_REPOSITORY, TOKEN_VERIFIER } from "../account.tokens.js";
import { CurrentUser, Public, Roles } from "./access.decorators.js";

const coisas = [{ id: "coisa-do-bruno", ownerId: "bruno" }];

@Controller()
class RoutesController {
  @Get("me/coisas/:id")
  coisa(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    return ownedOrNotFound(
      coisas.find((c) => c.id === id),
      user.id,
    );
  }

  @Get("me/profile")
  customerRoute(@CurrentUser() user: { id: string; role: string }) {
    return { id: user.id, role: user.role };
  }

  @Get("admin/ping")
  @Roles("admin")
  adminRoute() {
    return { ok: true };
  }

  @Get("aberta")
  @Public()
  publicRoute() {
    return { ok: true };
  }
}

describe("proteção das rotas por token e papel", () => {
  const tokens = createTestTokens();
  const profiles = new InMemoryProfileRepository();
  let app: INestApplication;

  beforeAll(async () => {
    await profiles.ensureRole({ id: tokens.adminId, email: "admin@leguele.test" }, "admin");
    const verifier = new JwksTokenVerifier("http://jwks.test", (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, AccountModule],
      controllers: [RoutesController],
      providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
    })
      .overrideProvider(TOKEN_VERIFIER)
      .useValue(verifier)
      .overrideProvider(PROFILE_REPOSITORY)
      .useValue(profiles)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  const get = (path: string, token?: string) =>
    request(app.getHttpServer())
      .get(path)
      .set(token ? { Authorization: `Bearer ${token}` } : {});

  it.each([
    ["sem token", () => undefined],
    ["com assinatura adulterada", () => tokens.tampered()],
    ["expirado", () => tokens.expired()],
    ["assinado com HS256", () => tokens.hs256()],
  ])("rota de cliente %s responde 401 UNAUTHORIZED", async (_caso, token) => {
    const response = await get("/me/profile", token());

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("cliente com token válido acessa a rota de cliente e é cliente sem perfil registrado", async () => {
    const response = await get("/me/profile", tokens.customer());

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: tokens.customerId, role: "customer" });
  });

  it("cliente na rota de admin recebe 403 FORBIDDEN", async () => {
    const response = await get("/admin/ping", tokens.customer());

    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ code: "FORBIDDEN" });
  });

  it("admin acessa a rota de admin", async () => {
    const response = await get("/admin/ping", tokens.admin());

    expect(response.status).toBe(200);
  });

  it("rota pública responde sem token", async () => {
    const response = await get("/aberta");

    expect(response.status).toBe(200);
  });

  it("o recurso de outro cliente responde 404 NOT_FOUND, igual ao de um id que não existe", async () => {
    const doBruno = await get("/me/coisas/coisa-do-bruno", tokens.customer());
    const inexistente = await get("/me/coisas/nao-existe", tokens.customer());

    expect(doBruno.status).toBe(404);
    expect(doBruno.body).toMatchObject({ code: "NOT_FOUND" });
    expect(doBruno.body).toEqual(inexistente.body);
    expect(inexistente.status).toBe(404);
  });
});
