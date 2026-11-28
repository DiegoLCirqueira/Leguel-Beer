import { estoqueBaixoNoAdmin } from "@leguele/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaAdminSummaryReader } from "./prisma-admin-summary-reader.js";
import { PrismaStockRepository } from "./prisma-stock-repository.js";

const NOW = new Date("2026-11-28T15:00:00.000Z");

describe("PrismaAdminSummaryReader (banco real)", () => {
  const prisma = new PrismaService();
  const stock = new PrismaStockRepository(prisma);
  const reader = new PrismaAdminSummaryReader(prisma, stock);
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

  it("concorda com a regra única do selo Baixo da tela de Estoque, nas bordas e com reserva válida ou vencida", async () => {
    // [físico, mínimo, reservado válido, reservado vencido]
    const cases: [number, number, number, number][] = [
      [7, 6, 0, 0],
      [6, 6, 0, 0],
      [5, 6, 0, 0],
      [0, 0, 0, 0],
      [10, 6, 4, 0],
      [10, 6, 3, 0],
      [10, 6, 0, 8],
    ];
    for (const [stock, minStock, valid, expired] of cases) {
      const b = await beer(stock, minStock);
      if (valid > 0) await order("AWAITING_PAYMENT", b.id, valid);
      if (expired > 0) {
        const old = await order("AWAITING_PAYMENT", b.id, expired);
        await prisma.stockReservation.updateMany({
          where: { orderId: old.id },
          data: { expiresAt: new Date(NOW.getTime() - 60_000) },
        });
      }
    }

    const expected = cases.filter(([stock, minStock, valid]) =>
      estoqueBaixoNoAdmin(stock - valid, minStock),
    ).length;

    expect((await reader.read(NOW)).lowStockBeers).toBe(expected);
    expect(expected).toBe(4);
  });

  it("o resumo conta exatamente as cervejas que a lista do Estoque marca como Baixo", async () => {
    const cases: [number, number, number][] = [
      [7, 6, 0],
      [6, 6, 0],
      [5, 6, 0],
      [0, 0, 0],
      [10, 6, 4],
      [10, 6, 3],
    ];
    for (const [stockUnits, minStock, reserved] of cases) {
      const b = await beer(stockUnits, minStock);
      if (reserved > 0) await order("AWAITING_PAYMENT", b.id, reserved);
    }

    const lowInList = (await stock.list(NOW)).filter((item) => item.low).length;

    expect((await reader.read(NOW)).lowStockBeers).toBe(lowInList);
    expect(lowInList).toBe(4);
  });
});
