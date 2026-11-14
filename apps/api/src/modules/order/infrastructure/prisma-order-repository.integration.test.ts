import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaOrderRepository } from "./prisma-order-repository.js";

const EXPIRES_AT = new Date("2026-11-14T10:30:00.000Z");
const NOW = new Date("2026-11-14T10:31:00.000Z");

describe("PrismaOrderRepository (banco real)", () => {
  const prisma = new PrismaService();
  const orders = new PrismaOrderRepository(prisma);
  let profileId: string;
  let beerId: string;
  let orderId: string;

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
    orderId = (
      await prisma.order.create({
        data: {
          number: "#LB482731",
          profileId,
          paymentMethod: "PIX",
          subtotalCents: 6400,
          shippingCents: 0,
          totalCents: 6400,
          expiresAt: EXPIRES_AT,
          customerName: "Ana Souza",
          customerPhone: "82999990000",
          shipZip: "57035000",
          shipStreet: "Rua do Sol",
          shipNumber: "100",
          shipDistrict: "Farol",
          shipCity: "Maceió",
          shipState: "AL",
          reservations: { create: { beerId, quantity: 2, expiresAt: EXPIRES_AT } },
          pendingDeductions: { create: { beerId, quantity: 2 } },
        },
      })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  it("cancela o pedido aguardando pagamento, libera a reserva, descarta a baixa pendente e grava o histórico", async () => {
    const cancelled = await orders.cancelIfAwaitingPayment(orderId, "pagamento não concluído", NOW);

    expect(cancelled).toBe(true);
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(order.status).toBe("CANCELLED");
    expect(order.cancelReason).toBe("pagamento não concluído");
    const reservations = await prisma.stockReservation.findMany({ where: { orderId } });
    expect(reservations.map((r) => r.releasedAt)).toEqual([NOW]);
    expect(await prisma.fridgePendingDeduction.count({ where: { orderId } })).toBe(0);
    const history = await prisma.orderStatusHistory.findMany({ where: { orderId } });
    expect(history).toMatchObject([
      {
        fromStatus: "AWAITING_PAYMENT",
        toStatus: "CANCELLED",
        reason: "pagamento não concluído",
        actorId: null,
      },
    ]);
  });

  it("cancela uma vez só quando várias expirações chegam juntas (cron e leitura)", async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        orders.cancelIfAwaitingPayment(orderId, "pagamento não concluído", NOW),
      ),
    );

    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await prisma.orderStatusHistory.count({ where: { orderId } })).toBe(1);
  });

  it("não mexe no pedido que já foi pago", async () => {
    await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    const cancelled = await orders.cancelIfAwaitingPayment(orderId, "pagamento não concluído", NOW);

    expect(cancelled).toBe(false);
    const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
    expect(order).toMatchObject({ status: "PAID", cancelReason: null });
    expect(await prisma.stockReservation.count({ where: { orderId, releasedAt: null } })).toBe(1);
    expect(await prisma.fridgePendingDeduction.count({ where: { orderId } })).toBe(1);
    expect(await prisma.orderStatusHistory.count({ where: { orderId } })).toBe(0);
  });

  it("lê o pedido para a expiração com o status do contrato e a validade", async () => {
    expect(await orders.findForExpiration(orderId)).toEqual({
      id: orderId,
      status: "aguardando-pagamento",
      expiresAt: EXPIRES_AT,
    });
    expect(await orders.findForExpiration(crypto.randomUUID())).toBeNull();
  });

  it("lista só os pedidos aguardando pagamento vencidos, a partir do instante exato do vencimento", async () => {
    const other = await prisma.order.create({
      data: {
        number: "#LB111111",
        profileId,
        paymentMethod: "PIX",
        subtotalCents: 3200,
        shippingCents: 0,
        totalCents: 3200,
        expiresAt: EXPIRES_AT,
        status: "PAID",
        customerName: "Ana Souza",
        customerPhone: "82999990000",
        shipZip: "57035000",
        shipStreet: "Rua do Sol",
        shipNumber: "100",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
      },
    });

    expect(await orders.findDueOrderIds(new Date(EXPIRES_AT.getTime() - 1))).toEqual([]);
    expect(await orders.findDueOrderIds(EXPIRES_AT)).toEqual([orderId]);
    expect(await orders.findDueOrderIds(NOW)).not.toContain(other.id);
  });

  it("não grava nenhum efeito da expiração se a escrita do histórico falha", async () => {
    await prisma.$executeRawUnsafe(
      "CREATE OR REPLACE FUNCTION fail_history_insert() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''falha forçada no histórico''; END;'",
    );
    await prisma.$executeRawUnsafe(
      "CREATE TRIGGER fail_history_insert BEFORE INSERT ON order_status_history FOR EACH ROW EXECUTE FUNCTION fail_history_insert()",
    );
    try {
      await expect(
        orders.cancelIfAwaitingPayment(orderId, "pagamento não concluído", NOW),
      ).rejects.toThrow();

      const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
      expect(order).toMatchObject({ status: "AWAITING_PAYMENT", cancelReason: null });
      expect(await prisma.stockReservation.count({ where: { orderId, releasedAt: null } })).toBe(1);
      expect(await prisma.fridgePendingDeduction.count({ where: { orderId } })).toBe(1);
      expect(await prisma.orderStatusHistory.count({ where: { orderId } })).toBe(0);
    } finally {
      await prisma.$executeRawUnsafe("DROP TRIGGER fail_history_insert ON order_status_history");
      await prisma.$executeRawUnsafe("DROP FUNCTION fail_history_insert()");
    }
  });

  it.each([
    ["AWAITING_PAYMENT", "aguardando-pagamento"],
    ["PAID", "pago"],
    ["PREPARING", "em-preparo"],
    ["OUT_FOR_DELIVERY", "saiu-para-entrega"],
    ["DELIVERED", "entregue"],
    ["CANCELLED", "cancelado"],
  ] as const)("lê o status %s do pedido como %s", async (row, status) => {
    await prisma.order.update({ where: { id: orderId }, data: { status: row } });

    expect(await orders.findForExpiration(orderId)).toMatchObject({ status });
  });
});
