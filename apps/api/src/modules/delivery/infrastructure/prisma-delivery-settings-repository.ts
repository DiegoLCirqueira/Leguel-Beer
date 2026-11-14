import type { PrismaService } from "../../../common/prisma/prisma.service.js";
import type {
  DeliverySettings,
  DeliverySettingsRepository,
} from "../domain/delivery-settings-repository.js";

export class PrismaDeliverySettingsRepository implements DeliverySettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<DeliverySettings> {
    const row = await this.prisma.deliverySettings.findUniqueOrThrow({ where: { id: 1 } });
    return {
      taxaBaseCentavos: row.baseFeeCents,
      valorPorKmCentavos: row.perKmFeeCents,
      raioMaximoMetros: row.maxRadiusMeters,
      freteGratisMinimoCentavos: row.freeShippingMinimumCents,
      origem: { latitude: row.originLatitude, longitude: row.originLongitude },
    };
  }
}
