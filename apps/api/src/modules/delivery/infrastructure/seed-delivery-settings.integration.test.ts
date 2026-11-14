import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaDeliverySettingsRepository } from "./prisma-delivery-settings-repository.js";
import { seedDeliverySettings } from "./seed-delivery-settings.js";

describe("seedDeliverySettings (banco real)", () => {
  const prisma = new PrismaService();

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("cria as configurações iniciais da spec: R$ 5,00 + R$ 1,50 por km, 25 km e frete grátis a partir de R$ 150,00", async () => {
    await seedDeliverySettings(prisma);

    const settings = await new PrismaDeliverySettingsRepository(prisma).get();
    expect(settings).toMatchObject({
      taxaBaseCentavos: 500,
      valorPorKmCentavos: 150,
      raioMaximoMetros: 25_000,
      freteGratisMinimoCentavos: 15_000,
    });
  });

  it("rodar de novo mantém uma linha só e não sobrescreve valores já alterados", async () => {
    await seedDeliverySettings(prisma);
    await prisma.deliverySettings.update({ where: { id: 1 }, data: { perKmFeeCents: 200 } });

    await seedDeliverySettings(prisma);

    expect(await prisma.deliverySettings.count()).toBe(1);
    expect(
      (await prisma.deliverySettings.findUniqueOrThrow({ where: { id: 1 } })).perKmFeeCents,
    ).toBe(200);
  });
});
