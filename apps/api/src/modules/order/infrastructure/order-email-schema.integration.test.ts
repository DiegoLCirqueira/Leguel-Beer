import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("marca de e-mail de confirmação no pedido (banco real)", () => {
  const prisma = new PrismaService();
  let orderId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    const profile = await prisma.profile.create({
      data: { id: crypto.randomUUID(), email: "a@x.test" },
    });
    orderId = (
      await prisma.order.create({
        data: {
          number: "#LB482731",
          profileId: profile.id,
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

  it("o pedido nasce sem a marca e guarda o instante do envio", async () => {
    const created = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(created.confirmationEmailSentAt).toBeNull();

    const sentAt = new Date("2026-11-27T15:00:00.000Z");
    await prisma.order.update({
      where: { id: orderId },
      data: { confirmationEmailSentAt: sentAt },
    });

    const marked = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(marked.confirmationEmailSentAt).toEqual(sentAt);
  });
});
