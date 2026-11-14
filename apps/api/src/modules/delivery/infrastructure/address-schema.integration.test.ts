import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("regras do schema dos endereços (banco real)", () => {
  const prisma = new PrismaService();
  let profileId: string;
  let otherProfileId: string;

  const address = (overrides: object = {}) => ({
    profileId,
    zip: "57035000",
    street: "Rua do Sol",
    number: "100",
    district: "Farol",
    city: "Maceió",
    state: "AL",
    isDefault: false,
    latitude: -9.66,
    longitude: -35.74,
    distanceMeters: 5_200,
    routeOriginLatitude: -9.6649,
    routeOriginLongitude: -35.7313,
    ...overrides,
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
    profileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
    otherProfileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "b@x.test" } })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  it("aceita só um endereço padrão por cliente, mas um padrão para cada cliente", async () => {
    await prisma.address.create({ data: address({ isDefault: true }) });

    await expect(
      prisma.address.create({ data: address({ isDefault: true, street: "Rua da Praia" }) }),
    ).rejects.toThrow();
    await prisma.address.create({ data: address({ isDefault: false, street: "Rua da Praia" }) });
    await prisma.address.create({ data: address({ profileId: otherProfileId, isDefault: true }) });

    expect(await prisma.address.count({ where: { isDefault: true } })).toBe(2);
  });

  it.each([
    ["UF fora de Alagoas", { state: "SP" }],
    ["distância negativa", { distanceMeters: -1 }],
    ["latitude fora da faixa", { latitude: 90.01 }],
    ["longitude fora da faixa", { longitude: -180.01 }],
    ["latitude da origem fora da faixa", { routeOriginLatitude: -90.01 }],
    ["longitude da origem fora da faixa", { routeOriginLongitude: 180.01 }],
  ])("recusa %s", async (_name, overrides) => {
    await expect(prisma.address.create({ data: address(overrides) })).rejects.toThrow();
  });

  it("aceita endereço sem rota (distância nula) e com os limites das coordenadas", async () => {
    await prisma.address.create({
      data: address({ distanceMeters: null, latitude: -90, longitude: 180 }),
    });

    expect(await prisma.address.count()).toBe(1);
  });

  it("apagar o perfil apaga os endereços dele e só os dele", async () => {
    await prisma.address.create({ data: address() });
    await prisma.address.create({ data: address({ profileId: otherProfileId }) });

    await prisma.profile.delete({ where: { id: profileId } });

    expect((await prisma.address.findMany()).map((a) => a.profileId)).toEqual([otherProfileId]);
  });
});
