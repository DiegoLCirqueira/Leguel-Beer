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
});
