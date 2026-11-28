import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaAdminSummaryReader } from "./prisma-admin-summary-reader.js";

const NOW = new Date("2026-11-28T15:00:00.000Z");

describe("PrismaAdminSummaryReader (banco real)", () => {
  const prisma = new PrismaService();
  const reader = new PrismaAdminSummaryReader(prisma);
  let profileId: string;
  let categoryId: string;
  let seq = 0;

  beforeEach(async () => {
    await resetDatabase(prisma);
    seq = 0;
    profileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } }))
      .id;
  });

  afterAll(() => prisma.onModuleDestroy());

  const beer = async (stock: number, minStock: number, active = true) => {
    seq += 1;
    return prisma.beer.create({
      data: {
        slug: `b${seq}`,
        name: `B${seq}`,
        style: "IPA",
        categoryId,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3000,
        stock,
        minStock,
        active,
      },
    });
  };

  const order = async (
    status: "PAID" | "PREPARING" | "AWAITING_PAYMENT",
    beerId?: string,
    reserved = 0,
  ) => {
    seq += 1;
    const expiresAt = new Date(NOW.getTime() + 10 * 60_000);
    return prisma.order.create({
      data: {
        number: `#LB${String(seq).padStart(6, "0")}`,
        profileId,
        status,
        paymentMethod: "PIX",
        subtotalCents: 1,
        shippingCents: 0,
        totalCents: 1,
        expiresAt,
        customerName: "Ana",
        customerPhone: "82999990000",
        shipZip: "57035000",
        shipStreet: "Rua",
        shipNumber: "1",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
        ...(beerId && reserved > 0
          ? { reservations: { create: { beerId, quantity: reserved, expiresAt } } }
          : {}),
      },
    });
  };

  it("conta as cervejas ativas com o disponível igual ou abaixo do mínimo", async () => {
    await beer(6, 6);
    await beer(7, 6);
    await beer(0, 6);
    await beer(1, 6, false);

    expect((await reader.read(NOW)).lowStockBeers).toBe(2);
  });

  it("a reserva válida entra no disponível; a vencida não", async () => {
    const reserved = await beer(10, 6);
    await order("AWAITING_PAYMENT", reserved.id, 5);
    const later = new Date(NOW.getTime() + 60 * 60_000);

    expect((await reader.read(NOW)).lowStockBeers).toBe(1);
    expect((await reader.read(later)).lowStockBeers).toBe(0);
  });

  it("conta só os pedidos pagos que aguardam preparo", async () => {
    await order("PAID");
    await order("PAID");
    await order("PREPARING");
    await order("AWAITING_PAYMENT");

    expect((await reader.read(NOW)).paidOrdersAwaitingPreparation).toBe(2);
  });
});
