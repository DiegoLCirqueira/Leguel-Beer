import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("regras do schema do pedido (banco real)", () => {
  const prisma = new PrismaService();
  let profileId: string;
  let beerId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    profileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
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
  });

  afterAll(() => prisma.onModuleDestroy());

  const pedido = (overrides: object = {}) => ({
    number: "#LB482731",
    profileId,
    paymentMethod: "PIX" as const,
    subtotalCents: 6400,
    shippingCents: 1300,
    totalCents: 7700,
    expiresAt: new Date("2026-11-13T10:30:00.000Z"),
    customerName: "Ana Souza",
    customerPhone: "82999990000",
    shipZip: "57035000",
    shipStreet: "Rua do Sol",
    shipNumber: "100",
    shipDistrict: "Farol",
    shipCity: "Maceió",
    shipState: "AL",
    ...overrides,
  });

  const item = (overrides: object = {}) => ({
    beerId,
    name: "Maré Alta",
    unitPriceCents: 3200,
    quantity: 2,
    ...overrides,
  });

  it("guarda o pedido aguardando pagamento com a cópia dos itens, do endereço e dos dados do cliente", async () => {
    const criado = await prisma.order.create({
      data: { ...pedido(), items: { create: [item()] } },
      include: { items: true },
    });

    expect(criado.status).toBe("AWAITING_PAYMENT");
    expect(criado.items.map((i) => [i.name, i.unitPriceCents, i.quantity])).toEqual([
      ["Maré Alta", 3200, 2],
    ]);
    expect(criado.shipCity).toBe("Maceió");
  });

  it("recusa o mesmo número de pedido duas vezes", async () => {
    await prisma.order.create({ data: pedido() });

    await expect(prisma.order.create({ data: pedido() })).rejects.toThrow();
  });

  it("recusa o total diferente de subtotal mais frete e valores negativos", async () => {
    await expect(prisma.order.create({ data: pedido({ totalCents: 7000 }) })).rejects.toThrow();
    await expect(
      prisma.order.create({
        data: pedido({ subtotalCents: -100, shippingCents: 100, totalCents: 0 }),
      }),
    ).rejects.toThrow();
  });

  it("guarda parcelas e bandeira só para cartão", async () => {
    await expect(
      prisma.order.create({ data: pedido({ paymentMethod: "PIX", installments: 3 }) }),
    ).rejects.toThrow();
    await expect(
      prisma.order.create({ data: pedido({ paymentMethod: "CARD" }) }),
    ).rejects.toThrow();

    await prisma.order.create({
      data: pedido({ paymentMethod: "CARD", installments: 3, cardBrand: "visa" }),
    });
  });

  it("recusa item com quantidade zero ou preço negativo e a mesma cerveja duas vezes", async () => {
    await expect(
      prisma.order.create({ data: { ...pedido(), items: { create: [item({ quantity: 0 })] } } }),
    ).rejects.toThrow();
    await expect(
      prisma.order.create({
        data: { ...pedido(), items: { create: [item({ unitPriceCents: -1 })] } },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.order.create({ data: { ...pedido(), items: { create: [item(), item()] } } }),
    ).rejects.toThrow();
  });

  it("apagar o perfil ou a cerveja com pedido é recusado: o pedido é histórico", async () => {
    await prisma.order.create({ data: { ...pedido(), items: { create: [item()] } } });

    await expect(prisma.profile.delete({ where: { id: profileId } })).rejects.toThrow();
    await expect(prisma.beer.delete({ where: { id: beerId } })).rejects.toThrow();
  });

  it("guarda o histórico de status e apaga junto com o pedido", async () => {
    const criado = await prisma.order.create({ data: pedido() });
    await prisma.orderStatusHistory.create({
      data: { orderId: criado.id, toStatus: "AWAITING_PAYMENT" },
    });
    await prisma.orderStatusHistory.create({
      data: {
        orderId: criado.id,
        fromStatus: "AWAITING_PAYMENT",
        toStatus: "CANCELLED",
        reason: "pagamento não concluído",
      },
    });

    const historico = await prisma.orderStatusHistory.findMany({
      where: { orderId: criado.id },
      orderBy: { createdAt: "asc" },
    });
    expect(historico.map((h) => [h.fromStatus, h.toStatus])).toEqual([
      [null, "AWAITING_PAYMENT"],
      ["AWAITING_PAYMENT", "CANCELLED"],
    ]);

    await prisma.order.delete({ where: { id: criado.id } });
    expect(await prisma.orderStatusHistory.count()).toBe(0);
  });
});
