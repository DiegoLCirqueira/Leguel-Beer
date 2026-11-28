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

    expect(await orders.findDueOrderIds(new Date(EXPIRES_AT.getTime() - 1), 100)).toEqual([]);
    expect(await orders.findDueOrderIds(EXPIRES_AT, 100)).toEqual([orderId]);
    expect(await orders.findDueOrderIds(NOW, 100)).not.toContain(other.id);
  });

  it("devolve no máximo o limite pedido, dos vencidos há mais tempo para os mais recentes", async () => {
    const base = {
      profileId,
      paymentMethod: "PIX" as const,
      subtotalCents: 3200,
      shippingCents: 0,
      totalCents: 3200,
      customerName: "Ana Souza",
      customerPhone: "82999990000",
      shipZip: "57035000",
      shipStreet: "Rua do Sol",
      shipNumber: "100",
      shipDistrict: "Farol",
      shipCity: "Maceió",
      shipState: "AL",
    };
    const older = await prisma.order.create({
      data: { ...base, number: "#LB000001", expiresAt: new Date(EXPIRES_AT.getTime() - 60_000) },
    });
    const newer = await prisma.order.create({
      data: { ...base, number: "#LB000002", expiresAt: new Date(EXPIRES_AT.getTime() + 60_000) },
    });

    expect(await orders.findDueOrderIds(NOW, 2)).toEqual([older.id, orderId]);
    expect(await orders.findDueOrderIds(NOW, 3)).toEqual([older.id, orderId, newer.id]);
  });

  it("o pedido que falha repetido vai para o fim da varredura e não ocupa o lote", async () => {
    const base = {
      profileId,
      paymentMethod: "PIX" as const,
      subtotalCents: 3200,
      shippingCents: 0,
      totalCents: 3200,
      customerName: "Ana Souza",
      customerPhone: "82999990000",
      shipZip: "57035000",
      shipStreet: "Rua do Sol",
      shipNumber: "100",
      shipDistrict: "Farol",
      shipCity: "Maceió",
      shipState: "AL",
    };
    const newer = await prisma.order.create({
      data: { ...base, number: "#LB000002", expiresAt: new Date(EXPIRES_AT.getTime() + 60_000) },
    });

    await orders.recordExpirationFailure(orderId);
    await orders.recordExpirationFailure(orderId);

    expect(await orders.findDueOrderIds(NOW, 1)).toEqual([newer.id]);
    expect(await orders.findDueOrderIds(NOW, 2)).toEqual([newer.id, orderId]);
    expect(
      (await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).expirationFailures,
    ).toBe(2);
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

  describe("confirmPaymentIfAwaiting", () => {
    const AT = new Date("2026-11-14T10:10:00.000Z");
    let adminId: string;

    beforeEach(async () => {
      adminId = (
        await prisma.profile.create({
          data: { id: crypto.randomUUID(), email: "admin@x.test", role: "ADMIN" },
        })
      ).id;
      await prisma.fridge.create({
        data: {
          profileId,
          items: { create: { beerId, quantity: 3, seenPriceCents: 3200, position: 0 } },
        },
      });
    });

    it("marca o pedido como pago, consome a reserva, baixa o estoque e a Geladeira e grava o histórico do admin", async () => {
      const confirmed = await orders.confirmPaymentIfAwaiting(orderId, adminId, AT);

      expect(confirmed).toBe(true);
      expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe(
        "PAID",
      );
      const reservations = await prisma.stockReservation.findMany({ where: { orderId } });
      expect(reservations.map((r) => [r.consumedAt, r.releasedAt])).toEqual([[AT, null]]);
      expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).stock).toBe(8);
      expect(await prisma.fridgePendingDeduction.count({ where: { orderId } })).toBe(0);
      const items = await prisma.fridgeItem.findMany({ where: { fridge: { profileId } } });
      expect(items.map((item) => item.quantity)).toEqual([1]);
      expect(await prisma.orderStatusHistory.findMany({ where: { orderId } })).toMatchObject([
        { fromStatus: "AWAITING_PAYMENT", toStatus: "PAID", actorId: adminId, createdAt: AT },
      ]);
    });

    it("não confirma a partir do instante exato do vencimento e nada muda", async () => {
      const confirmed = await orders.confirmPaymentIfAwaiting(orderId, adminId, EXPIRES_AT);

      expect(confirmed).toBe(false);
      expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe(
        "AWAITING_PAYMENT",
      );
      expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).stock).toBe(10);
      expect(await prisma.stockReservation.count({ where: { orderId, consumedAt: null } })).toBe(1);
      expect(await prisma.fridgePendingDeduction.count({ where: { orderId } })).toBe(1);
      expect(await prisma.orderStatusHistory.count({ where: { orderId } })).toBe(0);
    });

    it("confirmações e expirações simultâneas deixam um só resultado: uma baixa de estoque e um histórico", async () => {
      const results = await Promise.all([
        ...Array.from({ length: 5 }, () => orders.confirmPaymentIfAwaiting(orderId, adminId, AT)),
        ...Array.from({ length: 3 }, () =>
          orders.cancelIfAwaitingPayment(orderId, "pagamento não concluído", AT),
        ),
      ]);

      expect(results.filter(Boolean)).toHaveLength(1);
      expect(await prisma.orderStatusHistory.count({ where: { orderId } })).toBe(1);
      const order = await prisma.order.findUniqueOrThrow({ where: { id: orderId } });
      const beer = await prisma.beer.findUniqueOrThrow({ where: { id: beerId } });
      expect(beer.stock).toBe(order.status === "PAID" ? 8 : 10);
      const fridge = await prisma.fridgeItem.findMany({ where: { fridge: { profileId } } });
      expect(fridge.map((item) => item.quantity)).toEqual([order.status === "PAID" ? 1 : 3]);
    });

    it("tira da Geladeira a cerveja que chega a zero e mantém as outras", async () => {
      await prisma.fridgeItem.updateMany({
        where: { fridge: { profileId } },
        data: { quantity: 2 },
      });
      const other = await prisma.beer.create({
        data: {
          slug: "ponta-verde",
          name: "Ponta Verde",
          style: "Pilsen",
          categoryId: (await prisma.category.findFirstOrThrow()).id,
          abv: 4.5,
          ibu: 15,
          volumeMl: 500,
          priceCents: 2800,
          stock: 5,
        },
      });
      const fridge = await prisma.fridge.findUniqueOrThrow({ where: { profileId } });
      await prisma.fridgeItem.create({
        data: {
          fridgeId: fridge.id,
          beerId: other.id,
          quantity: 1,
          seenPriceCents: 2800,
          position: 1,
        },
      });

      await orders.confirmPaymentIfAwaiting(orderId, adminId, AT);

      const items = await prisma.fridgeItem.findMany({
        where: { fridgeId: fridge.id },
        orderBy: { position: "asc" },
      });
      expect(items.map((item) => [item.beerId, item.quantity])).toEqual([[other.id, 1]]);
    });

    it("não grava nenhum efeito se a escrita do histórico falha", async () => {
      await prisma.$executeRawUnsafe(
        "CREATE OR REPLACE FUNCTION fail_history_insert() RETURNS trigger LANGUAGE plpgsql AS 'BEGIN RAISE EXCEPTION ''falha forçada no histórico''; END;'",
      );
      await prisma.$executeRawUnsafe(
        "CREATE TRIGGER fail_history_insert BEFORE INSERT ON order_status_history FOR EACH ROW EXECUTE FUNCTION fail_history_insert()",
      );
      try {
        await expect(orders.confirmPaymentIfAwaiting(orderId, adminId, AT)).rejects.toThrow();

        expect((await prisma.order.findUniqueOrThrow({ where: { id: orderId } })).status).toBe(
          "AWAITING_PAYMENT",
        );
        expect((await prisma.beer.findUniqueOrThrow({ where: { id: beerId } })).stock).toBe(10);
        expect(await prisma.stockReservation.count({ where: { orderId, consumedAt: null } })).toBe(
          1,
        );
        const items = await prisma.fridgeItem.findMany({ where: { fridge: { profileId } } });
        expect(items.map((item) => item.quantity)).toEqual([3]);
      } finally {
        await prisma.$executeRawUnsafe("DROP TRIGGER fail_history_insert ON order_status_history");
        await prisma.$executeRawUnsafe("DROP FUNCTION fail_history_insert()");
      }
    });
  });

  describe("trava do perfil dono do pedido", () => {
    const pause = (ms: number) =>
      new Promise<"waiting">((resolve) => setTimeout(resolve, ms, "waiting"));
    let adminId: string;

    beforeEach(async () => {
      // Outro perfil como autor: o autor no histórico é FK do perfil e já travaria a linha dele.
      adminId = (
        await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "adm@x.test" } })
      ).id;
    });

    /** Segura o `FOR UPDATE` do perfil, como a gravação da Geladeira, até `release()`. */
    async function holdProfileLock(): Promise<{ release: () => Promise<void> }> {
      let release!: () => void;
      const released = new Promise<void>((resolve) => (release = resolve));
      let acquired!: () => void;
      const locked = new Promise<void>((resolve) => (acquired = resolve));
      const transaction = prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM profiles WHERE id = ${profileId}::uuid FOR UPDATE`;
          acquired();
          await released;
        },
        { timeout: 15_000 },
      );
      await locked;
      return { release: async () => (release(), transaction) };
    }

    it.each([
      [
        "confirmar o pagamento",
        () =>
          orders.confirmPaymentIfAwaiting(orderId, adminId, new Date("2026-11-14T10:10:00.000Z")),
      ],
      [
        "cancelar ou expirar",
        () => orders.cancelIfAwaitingPayment(orderId, "pagamento não concluído", NOW),
      ],
    ])(
      "%s espera a trava do perfil e termina com true depois que ela é solta",
      async (_name, run) => {
        const lock = await holdProfileLock();
        const operation = run();

        const early = await Promise.race([operation.then(() => "done" as const), pause(300)]);
        expect(early).toBe("waiting");

        await lock.release();
        expect(await operation).toBe(true);
      },
    );
  });
});
