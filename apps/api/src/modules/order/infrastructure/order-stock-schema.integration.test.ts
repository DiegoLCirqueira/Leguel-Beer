import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("regras do schema de reservas, baixas pendentes e idempotência (banco real)", () => {
  const prisma = new PrismaService();
  let profileId: string;
  let otherProfileId: string;
  let beerId: string;
  let orderId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    profileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
    otherProfileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "b@x.test" } })
    ).id;
    const category = await prisma.category.create({
      data: { slug: "ipa", name: "IPAs", order: 1 },
    });
    beerId = (
      await prisma.beer.create({
        data: {
          slug: "mare-alta",
          name: "Maré Alta",
          style: "American IPA",
          categoryId: category.id,
          abv: 5,
          ibu: 30,
          volumeMl: 500,
          priceCents: 3200,
          stock: 10,
        },
      })
    ).id;
    orderId = (
      await prisma.order.create({
        data: {
          number: "#LB482731",
          profileId,
          paymentMethod: "PIX",
          subtotalCents: 6400,
          shippingCents: 0,
          totalCents: 6400,
          expiresAt: new Date("2026-11-13T10:30:00.000Z"),
          customerName: "Ana Souza",
          customerPhone: "82999990000",
          shipZip: "57035000",
          shipStreet: "Rua do Sol",
          shipNumber: "100",
          shipDistrict: "Farol",
          shipCity: "Maceió",
          shipState: "AL",
        },
      })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  const reserva = (overrides: object = {}) => ({
    orderId,
    beerId,
    quantity: 2,
    expiresAt: new Date("2026-11-13T10:30:00.000Z"),
    ...overrides,
  });

  it("guarda uma reserva por cerveja do pedido, com a validade e sem liberação", async () => {
    const criada = await prisma.stockReservation.create({ data: reserva() });

    expect(criada.quantity).toBe(2);
    expect(criada.releasedAt).toBeNull();
    expect(criada.consumedAt).toBeNull();
    await expect(prisma.stockReservation.create({ data: reserva() })).rejects.toThrow();
  });

  it.each([0, -1])("recusa reserva com quantidade %i", async (quantity) => {
    await expect(prisma.stockReservation.create({ data: reserva({ quantity }) })).rejects.toThrow();
  });

  it("recusa reserva liberada e consumida ao mesmo tempo", async () => {
    const agora = new Date();

    await expect(
      prisma.stockReservation.create({ data: reserva({ releasedAt: agora, consumedAt: agora }) }),
    ).rejects.toThrow();
  });

  it("apagar o pedido apaga a reserva; apagar a cerveja reservada é recusado", async () => {
    await prisma.stockReservation.create({ data: reserva() });

    await expect(prisma.beer.delete({ where: { id: beerId } })).rejects.toThrow();

    await prisma.order.delete({ where: { id: orderId } });
    expect(await prisma.stockReservation.count()).toBe(0);
  });

  it("guarda a baixa pendente da Geladeira, uma por cerveja do pedido, com quantidade maior que zero", async () => {
    await prisma.fridgePendingDeduction.create({ data: { orderId, beerId, quantity: 2 } });

    await expect(
      prisma.fridgePendingDeduction.create({ data: { orderId, beerId, quantity: 1 } }),
    ).rejects.toThrow();
    await prisma.fridgePendingDeduction.deleteMany();
    await expect(
      prisma.fridgePendingDeduction.create({ data: { orderId, beerId, quantity: 0 } }),
    ).rejects.toThrow();
  });

  const chave = (overrides: object = {}) => ({
    profileId,
    key: "7b0c2a52-5c6e-4a3e-9f1a-0d5b6f3b1c11",
    requestHash: "a".repeat(64),
    responseStatus: 201,
    responseBody: { id: "p1" },
    orderId,
    expiresAt: new Date("2026-11-14T10:00:00.000Z"),
    ...overrides,
  });

  it("guarda a chave de idempotência por cliente: a mesma chave de outro cliente é outra chave", async () => {
    await prisma.idempotencyKey.create({ data: chave() });

    await expect(prisma.idempotencyKey.create({ data: chave() })).rejects.toThrow();

    const outroPedido = await prisma.order.create({
      data: {
        number: "#LB111111",
        profileId: otherProfileId,
        paymentMethod: "PIX",
        subtotalCents: 100,
        shippingCents: 0,
        totalCents: 100,
        expiresAt: new Date("2026-11-13T10:30:00.000Z"),
        customerName: "Bia",
        customerPhone: "82999990001",
        shipZip: "57035000",
        shipStreet: "Rua do Mar",
        shipNumber: "1",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
      },
    });
    await prisma.idempotencyKey.create({
      data: chave({ profileId: otherProfileId, orderId: outroPedido.id }),
    });
    expect(await prisma.idempotencyKey.count()).toBe(2);
  });

  it("um pedido nasce de uma única chave", async () => {
    await prisma.idempotencyKey.create({ data: chave() });

    await expect(
      prisma.idempotencyKey.create({ data: chave({ key: "outra-chave-1234567" }) }),
    ).rejects.toThrow();
  });
});
