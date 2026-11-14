import { enderecoRespostaSchema, listaDeEnderecosSchema } from "@leguele/shared";
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
import { DeliveryModule } from "../delivery.module.js";
import { GEOCODER, ROUTE_CALCULATOR } from "../delivery.tokens.js";
import { seedDeliverySettings } from "../infrastructure/seed-delivery-settings.js";
import { FakeGeocoder, FakeRouteCalculator } from "../testing/fake-maps.js";

describe("endereços do cliente (HTTP, banco real)", () => {
  const tokens = createTestTokens();
  const geocoder = new FakeGeocoder();
  const router = new FakeRouteCalculator();
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const verifier = new JwksTokenVerifier("http://jwks.test", tokens.issuer, (() =>
      Promise.resolve(new Response(JSON.stringify(tokens.jwks)))) as typeof fetch);
    const moduleRef = await Test.createTestingModule({
      imports: [CommonModule, PrismaModule, AccountModule, DeliveryModule],
      providers: [
        { provide: APP_FILTER, useClass: AllExceptionsFilter },
        { provide: APP_PIPE, useClass: ZodValidationPipe },
      ],
    })
      .overrideProvider(TOKEN_VERIFIER)
      .useValue(verifier)
      .overrideProvider(GEOCODER)
      .useValue(geocoder)
      .overrideProvider(ROUTE_CALCULATOR)
      .useValue(router)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    await prisma.profile.create({ data: { id: tokens.customerId, email: "cliente@leguele.test" } });
    await seedDeliverySettings(prisma);
    geocoder.received.length = 0;
    router.received.length = 0;
    geocoder.respondWith({ latitude: -9.66, longitude: -35.74 });
    router.respondWith(5_200);
  });

  afterAll(() => app.close());

  const list = (token?: string) =>
    request(app.getHttpServer())
      .get("/me/enderecos")
      .set(token ? { Authorization: `Bearer ${token}` } : {});

  it("sem token responde 401", async () => {
    expect((await list()).status).toBe(401);
  });

  it("devolve a lista vazia para o cliente sem endereços, no formato do contrato", async () => {
    const response = await list(tokens.customer());

    expect(response.status).toBe(200);
    expect(listaDeEnderecosSchema.parse(response.body)).toEqual([]);
  });

  it("sem a configuração de entrega responde 503 DELIVERY_SETTINGS_MISSING, sem stack nem detalhe interno", async () => {
    await prisma.deliverySettings.deleteMany();

    const response = await list(tokens.customer());

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      code: "DELIVERY_SETTINGS_MISSING",
      message: "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
    });
    expect(JSON.stringify(response.body)).not.toMatch(/stack|DeliverySettingsNotConfigured|at \w/);
  });

  const form = {
    cep: "57035-000",
    rua: "Rua do Sol",
    numero: "100",
    bairro: "Farol",
    cidade: "Maceió",
    uf: "AL",
  };

  const create = (body: object, token = tokens.customer()) =>
    request(app.getHttpServer())
      .post("/me/enderecos")
      .set({ Authorization: `Bearer ${token}` })
      .send(body);

  it("salva o primeiro endereço como padrão e grava as coordenadas calculadas pela API, ignorando as do corpo", async () => {
    const response = await create({ ...form, latitude: 10, longitude: 20, distanciaMetros: 1 });

    expect(response.status).toBe(201);
    expect(enderecoRespostaSchema.parse(response.body)).toMatchObject({
      cep: "57035000",
      rua: "Rua do Sol",
      padrao: true,
      foraDaArea: false,
    });
    const [saved] = await prisma.address.findMany();
    expect(saved).toMatchObject({
      profileId: tokens.customerId,
      latitude: -9.66,
      longitude: -35.74,
      distanceMeters: 5_200,
      isDefault: true,
    });
  });

  it("recusa o corpo fora do contrato (CEP de outro estado) com 400 e sem gravar nem chamar os mapas", async () => {
    const response = await create({ ...form, cep: "01432-000" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
    expect(await prisma.address.count()).toBe(0);
    expect(geocoder.received).toEqual([]);
  });

  it("marca como fora da área o endereço sem rota ou além de 25 km", async () => {
    router.respondWith(26_000);
    const far = await create(form);
    router.respondWith(null);
    const noRoute = await create({ ...form, rua: "Rua sem estrada" });

    expect(far.body).toMatchObject({ foraDaArea: true, padrao: true });
    expect(noRoute.body).toMatchObject({ foraDaArea: true, padrao: false });
  });

  it("recusa o sexto endereço com 422 ADDRESS_LIMIT_REACHED, antes de chamar os mapas", async () => {
    for (let i = 0; i < 5; i++) expect((await create(form)).status).toBe(201);
    const callsBefore = geocoder.received.length;

    const response = await create(form);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      code: "ADDRESS_LIMIT_REACHED",
      message: "Você pode guardar até 5 endereços.",
    });
    expect(geocoder.received).toHaveLength(callsBefore);
    expect(await prisma.address.count()).toBe(5);
  });

  it("endereço que o serviço de mapas não acha responde 422 ADDRESS_NOT_LOCATED e não grava nada", async () => {
    geocoder.respondWith(null);

    const response = await create(form);

    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      code: "ADDRESS_NOT_LOCATED",
      message: "Não encontramos este endereço. Confira a rua, o número e o CEP.",
    });
    expect(await prisma.address.count()).toBe(0);
  });

  it.each([
    ["geocodificação", () => geocoder.respondWith("unavailable")],
    ["rota", () => router.respondWith("unavailable")],
  ])(
    "mapas fora do ar (%s): 503 MAPS_UNAVAILABLE, sem stack, e nada é gravado",
    async (_nome, fail) => {
      fail();

      const response = await create(form);

      expect(response.status).toBe(503);
      expect(response.body).toEqual({
        code: "MAPS_UNAVAILABLE",
        message: "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
      });
      expect(await prisma.address.count()).toBe(0);
    },
  );

  it("sem a configuração de entrega: 503 DELIVERY_SETTINGS_MISSING, nada gravado e mapas intactos", async () => {
    await prisma.deliverySettings.deleteMany();

    const response = await create(form);

    expect(response.status).toBe(503);
    expect(response.body.code).toBe("DELIVERY_SETTINGS_MISSING");
    expect(await prisma.address.count()).toBe(0);
    expect(geocoder.received).toEqual([]);
  });

  it("conta sem perfil recebe 409", async () => {
    await prisma.profile.delete({ where: { id: tokens.customerId } });

    expect((await create(form)).status).toBe(409);
  });

  const edit = (id: string, body: object, token = tokens.customer()) =>
    request(app.getHttpServer())
      .put(`/me/enderecos/${id}`)
      .set({ Authorization: `Bearer ${token}` })
      .send(body);

  it("edita o endereço, recalcula a distância e devolve o resultado", async () => {
    const { body: created } = await create(form);
    router.respondWith(8_000);

    const response = await edit(created.id, { ...form, rua: "Rua da Praia", apelido: "Casa" });

    expect(response.status).toBe(200);
    expect(enderecoRespostaSchema.parse(response.body)).toMatchObject({
      id: created.id,
      rua: "Rua da Praia",
      apelido: "Casa",
      padrao: true,
    });
    expect(await prisma.address.findUniqueOrThrow({ where: { id: created.id } })).toMatchObject({
      street: "Rua da Praia",
      distanceMeters: 8_000,
    });
  });

  it("editar o endereço de outro cliente ou inexistente responde 404 e não altera nada", async () => {
    const otherId = crypto.randomUUID();
    await prisma.profile.create({ data: { id: otherId, email: "outro@leguele.test" } });
    const theirs = await prisma.address.create({
      data: {
        profileId: otherId,
        zip: "57035000",
        street: "Rua do Outro",
        number: "1",
        district: "Farol",
        city: "Maceió",
        state: "AL",
        isDefault: true,
        latitude: -9.6,
        longitude: -35.7,
        distanceMeters: 1_000,
        routeOriginLatitude: -9.6649,
        routeOriginLongitude: -35.7313,
      },
    });

    const mine = await edit(theirs.id, { ...form, rua: "Invadida" });
    const missing = await edit(crypto.randomUUID(), form);
    const notAnId = await edit("nao-e-um-id", form);

    expect([mine.status, missing.status, notAnId.status]).toEqual([404, 404, 404]);
    expect(mine.body).toEqual({ code: "NOT_FOUND", message: "Recurso não encontrado." });
    expect((await prisma.address.findUniqueOrThrow({ where: { id: theirs.id } })).street).toBe(
      "Rua do Outro",
    );
  });

  it("com os mapas fora do ar a edição responde 503 e o endereço anterior continua como estava", async () => {
    const { body: created } = await create(form);
    const before = await prisma.address.findUniqueOrThrow({ where: { id: created.id } });
    geocoder.respondWith("unavailable");

    const response = await edit(created.id, { ...form, rua: "Rua da Praia" });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe("MAPS_UNAVAILABLE");
    expect(await prisma.address.findUniqueOrThrow({ where: { id: created.id } })).toEqual(before);
  });

  it("sem token a edição responde 401", async () => {
    const response = await request(app.getHttpServer())
      .put(`/me/enderecos/${crypto.randomUUID()}`)
      .send(form);

    expect(response.status).toBe(401);
  });

  it("a lista traz só os endereços do cliente do token, nunca os de outro", async () => {
    const otherId = crypto.randomUUID();
    await prisma.profile.create({ data: { id: otherId, email: "outro2@leguele.test" } });
    await prisma.address.create({
      data: {
        profileId: otherId,
        zip: "57035000",
        street: "Rua do Outro",
        number: "1",
        district: "Farol",
        city: "Maceió",
        state: "AL",
        isDefault: true,
        latitude: -9.6,
        longitude: -35.7,
        distanceMeters: 1_000,
        routeOriginLatitude: -9.6649,
        routeOriginLongitude: -35.7313,
      },
    });
    await create(form);

    const response = await list(tokens.customer());

    expect(response.body.map((item: { rua: string }) => item.rua)).toEqual(["Rua do Sol"]);
  });

  const remove = (id: string, token = tokens.customer()) =>
    request(app.getHttpServer())
      .delete(`/me/enderecos/${id}`)
      .set({ Authorization: `Bearer ${token}` });

  it("exclui o endereço padrão e torna padrão o mais recente", async () => {
    const { body: casa } = await create(form);
    const { body: trabalho } = await create({ ...form, rua: "Rua da Praia" });
    const { body: sitio } = await create({ ...form, rua: "Rua do Sítio" });

    const response = await remove(casa.id);

    expect(response.status).toBe(204);
    const remaining = await list(tokens.customer());
    expect(remaining.body.map((a: { id: string; padrao: boolean }) => [a.id, a.padrao])).toEqual([
      [trabalho.id, false],
      [sitio.id, true],
    ]);
  });

  const makeDefault = (id: string, token = tokens.customer()) =>
    request(app.getHttpServer())
      .post(`/me/enderecos/${id}/padrao`)
      .set({ Authorization: `Bearer ${token}` });

  it("troca o endereço padrão: só o escolhido fica com o selo", async () => {
    const { body: casa } = await create(form);
    const { body: trabalho } = await create({ ...form, rua: "Rua da Praia" });

    const response = await makeDefault(trabalho.id);

    expect(response.status).toBe(204);
    const after = await list(tokens.customer());
    expect(after.body.map((a: { id: string; padrao: boolean }) => [a.id, a.padrao])).toEqual([
      [casa.id, false],
      [trabalho.id, true],
    ]);
  });

  it.each([
    ["excluir", (id: string) => remove(id)],
    ["tornar padrão", (id: string) => makeDefault(id)],
  ])(
    "%s o endereço de outro cliente ou inexistente responde 404 e não muda nada",
    async (_nome, act) => {
      const otherId = crypto.randomUUID();
      await prisma.profile.create({
        data: { id: otherId, email: `outro-${otherId}@leguele.test` },
      });
      const theirs = await prisma.address.create({
        data: {
          profileId: otherId,
          zip: "57035000",
          street: "Rua do Outro",
          number: "1",
          district: "Farol",
          city: "Maceió",
          state: "AL",
          isDefault: true,
          latitude: -9.6,
          longitude: -35.7,
          distanceMeters: 1_000,
          routeOriginLatitude: -9.6649,
          routeOriginLongitude: -35.7313,
        },
      });
      await create(form);

      const others = await act(theirs.id);
      const missing = await act(crypto.randomUUID());

      expect([others.status, missing.status]).toEqual([404, 404]);
      expect(await prisma.address.count({ where: { profileId: otherId, isDefault: true } })).toBe(
        1,
      );
      expect(await prisma.address.count({ where: { profileId: tokens.customerId } })).toBe(1);
    },
  );

  it.each([
    ["excluir", () => request(app.getHttpServer()).delete(`/me/enderecos/${crypto.randomUUID()}`)],
    [
      "tornar padrão",
      () => request(app.getHttpServer()).post(`/me/enderecos/${crypto.randomUUID()}/padrao`),
    ],
  ])("%s sem token responde 401", async (_nome, act) => {
    expect((await act()).status).toBe(401);
  });
});
