import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaConfirmationEmailSource } from "./prisma-confirmation-email-source.js";

const CREATED_AT = new Date("2026-11-27T14:00:00.000Z");

describe("PrismaConfirmationEmailSource (banco real)", () => {
  const prisma = new PrismaService();
  const source = new PrismaConfirmationEmailSource(prisma);
  let orderId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    const profile = await prisma.profile.create({
      data: { id: crypto.randomUUID(), email: "ana@exemplo.com", nome: "Ana Souza" },
    });
    const category = await prisma.category.create({
      data: { slug: "ipa", name: "IPAs", order: 1 },
    });
    const beer = await prisma.beer.create({
      data: {
        slug: "mare-alta",
        name: "Maré Alta",
        style: "American IPA",
        categoryId: category.id,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3_900,
        stock: 10,
      },
    });
    orderId = (
      await prisma.order.create({
        data: {
          number: "#LB482731",
          profileId: profile.id,
          paymentMethod: "CARD",
          installments: 3,
          subtotalCents: 11_700,
          shippingCents: 1_300,
          totalCents: 13_000,
          expiresAt: new Date(CREATED_AT.getTime() + 30 * 60_000),
          customerName: "Ana Souza",
          customerPhone: "82999990000",
          shipZip: "57035000",
          shipStreet: "Rua do Sol",
          shipNumber: "100",
          shipDistrict: "Farol",
          shipCity: "Maceió",
          shipState: "AL",
          createdAt: CREATED_AT,
          items: {
            create: { beerId: beer.id, name: "Maré Alta", unitPriceCents: 3_900, quantity: 3 },
          },
        },
      })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  it("lê o e-mail da conta, o pedido e a cópia do endereço, sem o telefone", async () => {
    const data = await source.find(orderId);

    expect(data).toEqual({
      to: "ana@exemplo.com",
      customerName: "Ana Souza",
      number: "#LB482731",
      createdAt: CREATED_AT,
      items: [{ name: "Maré Alta", priceCents: 3_900, quantity: 3 }],
      subtotalCents: 11_700,
      shippingCents: 1_300,
      totalCents: 13_000,
      payment: { tipo: "cartao", parcelas: 3 },
      shipTo: {
        zip: "57035000",
        street: "Rua do Sol",
        number: "100",
        complement: null,
        district: "Farol",
        city: "Maceió",
        state: "AL",
      },
    });
  });

  it("pedido inexistente não tem dados", async () => {
    expect(await source.find(crypto.randomUUID())).toBeNull();
  });

  it("grava o instante do envio na marca do pedido", async () => {
    const at = new Date("2026-11-27T15:00:00.000Z");

    await source.markSent(orderId, at);

    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(order.confirmationEmailSentAt).toEqual(at);
  });
});
