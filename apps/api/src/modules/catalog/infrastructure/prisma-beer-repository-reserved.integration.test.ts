import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaBeerRepository } from "./prisma-beer-repository.js";

const AGORA = new Date("2026-11-13T10:20:00.000Z");
const VALIDA = new Date("2026-11-13T10:30:00.000Z");
const VENCIDA = new Date("2026-11-13T10:10:00.000Z");

describe("quantidade reservada no catálogo (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaBeerRepository(prisma, { warn: () => undefined }, () => AGORA);
  let profileId: string;
  let categoryId: string;
  let sequence = 0;

  beforeEach(async () => {
    await resetDatabase(prisma);
    sequence = 0;
    profileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } }))
      .id;
  });

  afterAll(() => prisma.onModuleDestroy());

  const beer = (slug: string, stock = 10) =>
    prisma.beer.create({
      data: {
        slug,
        name: slug,
        style: "American IPA",
        categoryId,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3200,
        stock,
      },
    });

  async function reserve(beerId: string, quantity: number, overrides: object = {}) {
    sequence += 1;
    const order = await prisma.order.create({
      data: {
        number: `#LB10000${sequence}`,
        profileId,
        paymentMethod: "PIX",
        subtotalCents: 100,
        shippingCents: 0,
        totalCents: 100,
        expiresAt: VALIDA,
        customerName: "Ana",
        customerPhone: "82999990000",
        shipZip: "57035000",
        shipStreet: "Rua do Sol",
        shipNumber: "1",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
      },
    });
    await prisma.stockReservation.create({
      data: { orderId: order.id, beerId, quantity, expiresAt: VALIDA, ...overrides },
    });
  }

  it("desconta as reservas válidas de todos os pedidos, nas três leituras", async () => {
    const a = await beer("mare-alta", 10);
    await beer("sem-reserva", 4);
    await reserve(a.id, 3);
    await reserve(a.id, 2);

    const ativas = await repository.findActive();
    const porSlug = await repository.findActiveBySlug("mare-alta");
    const porIds = await repository.findByIds([a.id]);

    expect(ativas.map((b) => [b.slug, b.stock, b.reserved])).toEqual([
      ["mare-alta", 10, 5],
      ["sem-reserva", 4, 0],
    ]);
    expect(porSlug?.reserved).toBe(5);
    expect(porIds[0]?.beer.reserved).toBe(5);
  });

  it("não conta a reserva vencida, mesmo antes de o pedido ser cancelado", async () => {
    const a = await beer("mare-alta");
    await reserve(a.id, 3, { expiresAt: VENCIDA });
    await reserve(a.id, 2, { expiresAt: AGORA });

    expect((await repository.findActiveBySlug("mare-alta"))?.reserved).toBe(0);
  });

  it("não conta a reserva liberada nem a consumida pela aprovação", async () => {
    const a = await beer("mare-alta");
    await reserve(a.id, 3, { releasedAt: AGORA });
    await reserve(a.id, 2, { consumedAt: AGORA });
    await reserve(a.id, 1);

    expect((await repository.findActiveBySlug("mare-alta"))?.reserved).toBe(1);
  });

  it("separa as reservas de cada cerveja", async () => {
    const a = await beer("mare-alta");
    const b = await beer("cupuacu-ale");
    await reserve(a.id, 4);
    await reserve(b.id, 1);

    const porIds = await repository.findByIds([a.id, b.id]);

    expect(porIds.map((x) => [x.beer.slug, x.beer.reserved]).sort()).toEqual([
      ["cupuacu-ale", 1],
      ["mare-alta", 4],
    ]);
  });
});
