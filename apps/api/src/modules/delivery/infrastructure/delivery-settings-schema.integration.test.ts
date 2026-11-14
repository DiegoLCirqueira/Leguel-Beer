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
});
