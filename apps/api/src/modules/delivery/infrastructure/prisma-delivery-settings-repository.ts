import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import {
  DeliverySettingsNotConfiguredError,
  type DeliverySettings,
  type DeliverySettingsRepository,
} from "../domain/delivery-settings-repository.js";

export class PrismaDeliverySettingsRepository implements DeliverySettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<DeliverySettings> {
    const row = await this.prisma.deliverySettings.findUnique({ where: { id: 1 } });
    if (!row) throw new DeliverySettingsNotConfiguredError();
    return {
      taxaBaseCentavos: row.baseFeeCents,
      valorPorKmCentavos: row.perKmFeeCents,
      raioMaximoMetros: row.maxRadiusMeters,
      freteGratisMinimoCentavos: row.freeShippingMinimumCents,
      origem: { latitude: row.originLatitude, longitude: row.originLongitude },
    };
  }
}
