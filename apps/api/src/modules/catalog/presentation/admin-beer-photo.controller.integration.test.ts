import { caminhoDeEnvioRespostaSchema, cervejaDoAdminSchema } from "@leguele/shared";
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
import { PHOTO_STORAGE } from "../catalog.tokens.js";
import { InMemoryPhotoStorage } from "../testing/photo-fakes.js";

const webp = (size: number): Uint8Array => {
  const bytes = new Uint8Array(size);
  bytes.set([0x52, 0x49, 0x46, 0x46], 0);
  bytes.set([0x57, 0x45, 0x42, 0x50], 8);
  // Tamanho do bloco RIFF: o arquivo inteiro menos os 8 bytes do cabeçalho (little-endian).
  new DataView(bytes.buffer).setUint32(4, size - 8, true);
  return bytes;
};

describe("foto da cerveja do admin (HTTP, banco real, armazenamento falso)", () => {
  const tokens = createTestTokens();
  const adminToken = tokens.admin();
  const storage = new InMemoryPhotoStorage();
  let app: INestApplication;
  let prisma: PrismaService;
  let beerId: string;

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
      .overrideProvider(PHOTO_STORAGE)
      .useValue(storage)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    storage.uploads.clear();
    storage.published.clear();
    storage.deleted.length = 0;
    storage.tokens.length = 0;
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
        },
      })
    ).id;
  });

  afterAll(() => app.close());

  const post = (path: string, options: { token?: string | null; body?: object } = {}) => {
    const { token = adminToken, body } = options;
    const req = request(app.getHttpServer()).post(path);
    if (token) req.set("Authorization", `Bearer ${token}`);
    return body ? req.send(body) : req;
  };

  const issuePath = async () =>
    caminhoDeEnvioRespostaSchema.parse((await post("/admin/cervejas/foto/caminho")).body).caminho;

  it("sem token responde 401 e cliente comum 403, nos dois endpoints", async () => {
    expect((await post("/admin/cervejas/foto/caminho", { token: null })).status).toBe(401);
    expect((await post("/admin/cervejas/foto/caminho", { token: tokens.customer() })).status).toBe(
      403,
    );
    const body = { caminho: "0b8f3c1e-5a3d-4f6e-9a7b-1c2d3e4f5a6b.webp" };
    expect((await post(`/admin/cervejas/${beerId}/foto`, { token: null, body })).status).toBe(401);
    expect(
      (await post(`/admin/cervejas/${beerId}/foto`, { token: tokens.customer(), body })).status,
    ).toBe(403);
  });

  it("emite o caminho de envio (201) e publica a foto: a cerveja ganha o endereço público", async () => {
    const path = await issuePath();
    storage.uploads.set(path, webp(2_000));

    const response = await post(`/admin/cervejas/${beerId}/foto`, { body: { caminho: path } });

    expect(response.status).toBe(200);
    const beer = cervejaDoAdminSchema.parse(response.body);
    expect(beer.imagemUrl).toMatch(/^https:\/\/storage\.test\/public\/cervejas\/.+\.webp$/);
    expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).imageUrl).toBe(
      beer.imagemUrl,
    );
    // O armazenamento recebeu a sessão do próprio admin, repassada da requisição.
    expect(new Set(storage.tokens)).toEqual(new Set([adminToken]));
  });

  it("arquivo que não é WebP: 422 INVALID_PHOTO, envio apagado e a cerveja sem foto", async () => {
    const path = await issuePath();
    storage.uploads.set(path, new Uint8Array(500));

    const response = await post(`/admin/cervejas/${beerId}/foto`, { body: { caminho: path } });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({ code: "INVALID_PHOTO" });
    expect(storage.deleted).toEqual([path]);
    expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).imageUrl).toBeNull();
  });

  it("o mesmo caminho não vale duas vezes e caminho inventado é recusado: 422 PHOTO_PATH_INVALID", async () => {
    const path = await issuePath();
    storage.uploads.set(path, webp(1_000));
    await post(`/admin/cervejas/${beerId}/foto`, { body: { caminho: path } });

    const reused = await post(`/admin/cervejas/${beerId}/foto`, { body: { caminho: path } });
    const invented = await post(`/admin/cervejas/${beerId}/foto`, {
      body: { caminho: "0b8f3c1e-5a3d-4f6e-9a7b-1c2d3e4f5a6b.webp" },
    });

    expect(reused.status).toBe(422);
    expect(reused.body).toMatchObject({ code: "PHOTO_PATH_INVALID" });
    expect(invented.status).toBe(422);
  });

  it("caminho fora do formato (../, outra extensão) responde 400 e cerveja desconhecida 404", async () => {
    const path = await issuePath();

    for (const caminho of ["../segredo.webp", "foto.png", ""]) {
      expect((await post(`/admin/cervejas/${beerId}/foto`, { body: { caminho } })).status).toBe(
        400,
      );
    }
    expect(
      (await post(`/admin/cervejas/${crypto.randomUUID()}/foto`, { body: { caminho: path } }))
        .status,
    ).toBe(404);
  });
});
