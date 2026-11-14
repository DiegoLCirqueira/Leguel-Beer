import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { DeliverySettingsNotConfiguredError } from "../domain/delivery-settings-repository.js";
import { PrismaDeliverySettingsRepository } from "./prisma-delivery-settings-repository.js";

describe("PrismaDeliverySettingsRepository (banco real)", () => {
  const prisma = new PrismaService();
  const settings = new PrismaDeliverySettingsRepository(prisma);

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("devolve as configurações no formato do contrato de frete, com a origem", async () => {
    await prisma.deliverySettings.create({
      data: {
        originLatitude: -9.6649,
        originLongitude: -35.7313,
        baseFeeCents: 500,
        perKmFeeCents: 150,
        maxRadiusMeters: 25_000,
        freeShippingMinimumCents: 15_000,
      },
    });

    expect(await settings.get()).toEqual({
      taxaBaseCentavos: 500,
      valorPorKmCentavos: 150,
      raioMaximoMetros: 25_000,
      freteGratisMinimoCentavos: 15_000,
      origem: { latitude: -9.6649, longitude: -35.7313 },
    });
  });

  it("falha com erro claro quando as configurações não foram criadas", async () => {
    await expect(settings.get()).rejects.toBeInstanceOf(DeliverySettingsNotConfiguredError);
  });
});
