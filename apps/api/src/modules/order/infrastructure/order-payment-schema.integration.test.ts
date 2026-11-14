import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("regras do schema de pagamentos, eventos e marcas (banco real)", () => {
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

  const pagamento = (overrides: object = {}) => ({
    orderId,
    gatewayPaymentId: "mp-123",
    method: "PIX" as const,
    ...overrides,
  });

  it("guarda o pagamento pendente do pedido e recusa o mesmo id do gateway duas vezes", async () => {
    const criado = await prisma.payment.create({ data: pagamento() });

    expect(criado.status).toBe("PENDING");
    expect(criado.approvedAt).toBeNull();
    await expect(prisma.payment.create({ data: pagamento() })).rejects.toThrow();
  });

  it("um pedido pode ter vários pagamentos (troca de forma de pagamento)", async () => {
    await prisma.payment.create({ data: pagamento() });
    await prisma.payment.create({
      data: pagamento({ gatewayPaymentId: "mp-456", method: "CARD" }),
    });

    expect(await prisma.payment.count({ where: { orderId } })).toBe(2);
  });

  it("só o pagamento aprovado tem a hora da aprovação", async () => {
    const agora = new Date();

    await expect(
      prisma.payment.create({ data: pagamento({ status: "PENDING", approvedAt: agora }) }),
    ).rejects.toThrow();
    await expect(prisma.payment.create({ data: pagamento({ status: "APPROVED" }) })).rejects.toThrow();
    await prisma.payment.create({ data: pagamento({ status: "APPROVED", approvedAt: agora }) });
  });

  it("registra cada evento do gateway uma vez só", async () => {
    await prisma.paymentEvent.create({
      data: { gatewayEventId: "evt-1", gatewayPaymentId: "mp-123", orderId },
    });

    await expect(
      prisma.paymentEvent.create({
        data: { gatewayEventId: "evt-1", gatewayPaymentId: "mp-123", orderId },
      }),
    ).rejects.toThrow();
    await prisma.paymentEvent.create({
      data: { gatewayEventId: "evt-2", gatewayPaymentId: "mp-123", orderId },
    });
  });

  it("guarda o evento sem pedido (pagamento desconhecido) e não o apaga com o pedido", async () => {
    await prisma.paymentEvent.create({
      data: { gatewayEventId: "evt-9", gatewayPaymentId: "mp-999" },
    });
    await prisma.paymentEvent.create({
      data: { gatewayEventId: "evt-1", gatewayPaymentId: "mp-123", orderId },
    });

    await prisma.order.delete({ where: { id: orderId } });

    expect(await prisma.paymentEvent.count()).toBe(2);
  });

  it("marca o pedido para o admin, uma marca de cada tipo por pagamento", async () => {
    await prisma.paymentMark.create({
      data: { orderId, gatewayPaymentId: "mp-123", kind: "AFTER_CANCELLATION" },
    });

    await expect(
      prisma.paymentMark.create({
        data: { orderId, gatewayPaymentId: "mp-123", kind: "AFTER_CANCELLATION" },
      }),
    ).rejects.toThrow();
    await prisma.paymentMark.create({
      data: { orderId, gatewayPaymentId: "mp-123", kind: "DUPLICATE" },
    });
    expect(await prisma.paymentMark.count({ where: { orderId } })).toBe(2);
  });
});
