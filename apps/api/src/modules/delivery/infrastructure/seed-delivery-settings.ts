import type { PrismaService } from "../../../common/prisma/prisma.service.js";

/**
 * Valores iniciais da spec de endereços e entrega. A origem é um ponto FICTÍCIO em Jaraguá, Maceió:
 * antes de produção ela deve ser trocada pelo endereço real da cervejaria (decisão do Diego).
 */
const INITIAL_SETTINGS = {
  originLatitude: -9.6649,
  originLongitude: -35.7313,
  baseFeeCents: 500,
  perKmFeeCents: 150,
  maxRadiusMeters: 25_000,
  freeShippingMinimumCents: 15_000,
};

/** Cria as configurações se ainda não existirem; nunca sobrescreve valores já alterados. */
export async function seedDeliverySettings(prisma: PrismaService): Promise<void> {
  await prisma.deliverySettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...INITIAL_SETTINGS },
    update: {},
  });
}
