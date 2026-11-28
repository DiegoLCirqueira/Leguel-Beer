import { itemDoEstoqueSchema } from "@leguele/shared";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { StockBelowReservedError, StockNegativeError } from "../domain/stock.js";
import { PrismaStockRepository } from "./prisma-stock-repository.js";

const NOW = new Date("2026-11-28T15:00:00.000Z");

describe("PrismaStockRepository (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaStockRepository(prisma);
  let adminId: string;
  let customerId: string;
  let categoryId: string;
  let seq = 0;

  beforeEach(async () => {
    await resetDatabase(prisma);
    seq = 0;
    adminId = (
      await prisma.profile.create({
        data: { id: crypto.randomUUID(), email: "adm@x.test", role: "ADMIN" },
      })
    ).id;
    customerId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "c@x.test" } })
    ).id;
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } }))
      .id;
  });

  afterAll(() => prisma.onModuleDestroy());

  const beer = async (name: string, stock: number, minStock = 6, active = true) => {
    seq += 1;
    return prisma.beer.create({
      data: {
        slug: `b${seq}`,
        name,
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

  const reserve = async (beerId: string, quantity: number, expiresAt: Date) => {
    seq += 1;
    await prisma.order.create({
      data: {
        number: `#LB${String(seq).padStart(6, "0")}`,
        profileId: customerId,
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
        reservations: { create: { beerId, quantity, expiresAt } },
      },
    });
  };

  describe("list", () => {
    it("traz físico, reservado e disponível, com as cervejas Baixo primeiro e depois por nome", async () => {
      await beer("Zeta", 20);
      await beer("Alfa", 20);
      await beer("Beta", 3);
      const gama = await beer("Gama", 10);
      await reserve(gama.id, 4, new Date(NOW.getTime() + 600_000));

      const items = await repository.list(NOW);

      expect(items.map((i) => [i.name, i.low])).toEqual([
        ["Beta", true],
        ["Gama", true],
        ["Alfa", false],
        ["Zeta", false],
      ]);
      expect(items[1]).toMatchObject({ physical: 10, reserved: 4, available: 6, minimum: 6 });
    });

    it("a reserva vencida não entra e a cerveja inativa não aparece", async () => {
      const a = await beer("Alfa", 10);
      await reserve(a.id, 8, new Date(NOW.getTime() - 60_000));
      await beer("Inativa", 0, 6, false);

      const items = await repository.list(NOW);

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({ reserved: 0, available: 10, low: false });
    });

    it("cada item cabe no contrato itemDoEstoqueSchema", async () => {
      await beer("Alfa", 6);

      const [item] = await repository.list(NOW);

      expect(
        itemDoEstoqueSchema.safeParse({
          cervejaId: item?.beerId,
          nome: item?.name,
          fisico: item?.physical,
          reservado: item?.reserved,
          disponivel: item?.available,
          minimo: item?.minimum,
          baixo: item?.low,
        }).success,
      ).toBe(true);
    });
  });

  describe("adjust", () => {
    it("entrada soma ao físico e grava o movimento com autor, motivo e saldo", async () => {
      const a = await beer("Alfa", 10);

      const movement = await repository.adjust(
        a.id,
        adminId,
        { tipo: "entrada", quantidade: 5, motivo: "Produção" },
        NOW,
      );

      expect(movement).toMatchObject({
        kind: "entrada",
        quantity: 5,
        reason: "Produção",
        balanceAfter: 15,
        orderNumber: null,
        createdAt: NOW,
      });
      expect((await prisma.beer.findUniqueOrThrow({ where: { id: a.id } })).stock).toBe(15);
      expect(
        await prisma.stockMovement.findFirstOrThrow({ where: { beerId: a.id } }),
      ).toMatchObject({
        type: "ENTRY",
        actorId: adminId,
      });
    });

    it("perda subtrai (movimento negativo) e correção soma ou subtrai", async () => {
      const a = await beer("Alfa", 10);

      const loss = await repository.adjust(
        a.id,
        adminId,
        { tipo: "perda", quantidade: 3, motivo: "Quebra" },
        NOW,
      );
      const down = await repository.adjust(
        a.id,
        adminId,
        { tipo: "correcao", quantidade: -2, motivo: "Contagem" },
        NOW,
      );
      const up = await repository.adjust(
        a.id,
        adminId,
        { tipo: "correcao", quantidade: 4, motivo: "Contagem" },
        NOW,
      );

      expect([loss?.quantity, loss?.balanceAfter]).toEqual([-3, 7]);
      expect([down?.quantity, down?.balanceAfter]).toEqual([-2, 5]);
      expect([up?.quantity, up?.balanceAfter]).toEqual([4, 9]);
    });

    it("recusa físico negativo e físico abaixo do reservado, sem mexer no estoque nem gravar movimento", async () => {
      const a = await beer("Alfa", 10);
      await reserve(a.id, 6, new Date(NOW.getTime() + 600_000));

      await expect(
        repository.adjust(a.id, adminId, { tipo: "perda", quantidade: 11, motivo: "x" }, NOW),
      ).rejects.toBeInstanceOf(StockNegativeError);
      await expect(
        repository.adjust(a.id, adminId, { tipo: "perda", quantidade: 5, motivo: "x" }, NOW),
      ).rejects.toThrow(new StockBelowReservedError(6));
      expect((await prisma.beer.findUniqueOrThrow({ where: { id: a.id } })).stock).toBe(10);
      expect(await prisma.stockMovement.count()).toBe(0);
    });

    it("permite chegar exatamente no reservado e devolve null para cerveja que não existe", async () => {
      const a = await beer("Alfa", 10);
      await reserve(a.id, 6, new Date(NOW.getTime() + 600_000));

      await expect(
        repository.adjust(a.id, adminId, { tipo: "perda", quantidade: 4, motivo: "x" }, NOW),
      ).resolves.toMatchObject({ balanceAfter: 6 });
      expect(
        await repository.adjust(
          crypto.randomUUID(),
          adminId,
          { tipo: "entrada", quantidade: 1, motivo: "Produção" },
          NOW,
        ),
      ).toBeNull();
    });

    it("ajustes simultâneos não perdem unidades: 10 entradas de 1 somam 10", async () => {
      const a = await beer("Alfa", 0);

      await Promise.all(
        Array.from({ length: 10 }, () =>
          repository.adjust(
            a.id,
            adminId,
            { tipo: "entrada", quantidade: 1, motivo: "Produção" },
            NOW,
          ),
        ),
      );

      expect((await prisma.beer.findUniqueOrThrow({ where: { id: a.id } })).stock).toBe(10);
      expect(await prisma.stockMovement.count()).toBe(10);
    });

    it("espera a trava da cerveja que a criação do pedido também usa", async () => {
      const a = await beer("Alfa", 10);
      let release!: () => void;
      const released = new Promise<void>((resolve) => (release = resolve));
      let acquired!: () => void;
      const locked = new Promise<void>((resolve) => (acquired = resolve));
      const holding = prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM beers WHERE id = ${a.id}::uuid FOR UPDATE`;
          acquired();
          await released;
        },
        { timeout: 15_000 },
      );
      await locked;

      const adjusting = repository.adjust(
        a.id,
        adminId,
        { tipo: "entrada", quantidade: 1, motivo: "Produção" },
        NOW,
      );
      const early = await Promise.race([
        adjusting.then(() => "done" as const),
        new Promise<"waiting">((resolve) => setTimeout(resolve, 300, "waiting")),
      ]);
      expect(early).toBe("waiting");

      release();
      await holding;
      await expect(adjusting).resolves.toMatchObject({ balanceAfter: 11 });
    });
  });

  describe("movements", () => {
    it("lista do mais recente ao mais antigo e devolve null se a cerveja não existe", async () => {
      const a = await beer("Alfa", 10);
      await repository.adjust(
        a.id,
        adminId,
        { tipo: "entrada", quantidade: 1, motivo: "Produção" },
        new Date(NOW.getTime() - 120_000),
      );
      await repository.adjust(
        a.id,
        adminId,
        { tipo: "perda", quantidade: 2, motivo: "Quebra" },
        NOW,
      );

      const movements = await repository.movements(a.id);

      expect(movements?.map((m) => m.kind)).toEqual(["perda", "entrada"]);
      expect(await repository.movements(crypto.randomUUID())).toBeNull();
    });
  });
});
