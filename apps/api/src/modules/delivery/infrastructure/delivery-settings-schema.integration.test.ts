import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

const validSettings = {
  originLatitude: -9.6649,
  originLongitude: -35.7313,
  baseFeeCents: 500,
  perKmFeeCents: 150,
  maxRadiusMeters: 25_000,
  freeShippingMinimumCents: 15_000,
};

describe("regras do schema das configurações de entrega (banco real)", () => {
  const prisma = new PrismaService();

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("guarda uma linha só: a segunda é recusada pelo banco", async () => {
    await prisma.deliverySettings.create({ data: validSettings });

    await expect(prisma.deliverySettings.create({ data: validSettings })).rejects.toThrow();
    expect(await prisma.deliverySettings.count()).toBe(1);
  });

  it("recusa uma linha com outra chave, que burlaria a linha única", async () => {
    await expect(
      prisma.deliverySettings.create({ data: { ...validSettings, id: 2 } }),
    ).rejects.toThrow();
    expect(await prisma.deliverySettings.count()).toBe(0);
  });

  it.each([
    ["baseFeeCents", -1],
    ["perKmFeeCents", -1],
    ["maxRadiusMeters", -1],
    ["freeShippingMinimumCents", -1],
  ] as const)("recusa %s negativo", async (field, value) => {
    await expect(
      prisma.deliverySettings.create({ data: { ...validSettings, [field]: value } }),
    ).rejects.toThrow();
  });

  it.each([
    ["originLatitude", 90.01],
    ["originLatitude", -90.01],
    ["originLongitude", 180.01],
    ["originLongitude", -180.01],
  ] as const)("recusa %s fora da faixa (%s)", async (field, value) => {
    await expect(
      prisma.deliverySettings.create({ data: { ...validSettings, [field]: value } }),
    ).rejects.toThrow();
  });

  it("aceita zero nos valores e as coordenadas nos limites", async () => {
    await prisma.deliverySettings.create({
      data: {
        originLatitude: -90,
        originLongitude: 180,
        baseFeeCents: 0,
        perKmFeeCents: 0,
        maxRadiusMeters: 0,
        freeShippingMinimumCents: 0,
      },
    });

    expect(await prisma.deliverySettings.count()).toBe(1);
  });
});
