import { readFileSync } from "node:fs";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

const migration = (name: string) =>
  readFileSync(
    new URL(`../../../../prisma/migrations/${name}/migration.sql`, import.meta.url),
    "utf-8",
  );

const BACKFILL = migration("20261128140000_stock_movements_backfill");
const RECONCILE = migration("20261128150000_stock_movements_reconcile");

describe("saldo do histórico de estoque nas cervejas existentes (banco real)", () => {
  const prisma = new PrismaService();
  let categoryId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } }))
      .id;
  });

  afterAll(() => prisma.onModuleDestroy());

  const beer = (slug: string, stock: number) =>
    prisma.beer.create({
      data: {
        slug,
        name: slug,
        style: "IPA",
        categoryId,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3000,
        stock,
      },
    });

  const sums = async () => {
    const rows = await prisma.$queryRaw<{ slug: string; stock: number; total: number }[]>`
      SELECT b.slug, b.stock, COALESCE(SUM(m.quantity), 0)::int AS total
      FROM beers b LEFT JOIN stock_movements m ON m.beer_id = b.id
      GROUP BY b.id ORDER BY b.slug`;
    return rows;
  };

  it("depois de reconciliar, a soma dos movimentos é o estoque de cada cerveja (sem movimento, parcial e completa)", async () => {
    await beer("a-sem-movimento", 12);
    const parcial = await beer("b-parcial", 10);
    await prisma.stockMovement.create({
      data: { beerId: parcial.id, type: "SALE", quantity: -2, balanceAfter: 8 },
    });
    // Estoque 8 depois da venda de 2: faltam 10 de abertura para a soma bater (10 - 2 = 8).
    await prisma.beer.update({ where: { id: parcial.id }, data: { stock: 8 } });
    const completa = await beer("c-completa", 5);
    await prisma.stockMovement.create({
      data: {
        beerId: completa.id,
        type: "ENTRY",
        quantity: 5,
        reason: "Entrada inicial",
        balanceAfter: 5,
      },
    });
    await beer("d-zerada", 0);

    await prisma.$executeRawUnsafe(BACKFILL);
    await prisma.$executeRawUnsafe(RECONCILE);

    for (const row of await sums()) expect([row.slug, row.total]).toEqual([row.slug, row.stock]);
    const opening = await prisma.stockMovement.findMany({
      where: { beerId: parcial.id, reason: "Saldo inicial" },
    });
    expect(opening.map((m) => m.quantity)).toEqual([10]);
    // O saldo da abertura é a própria abertura: os movimentos seguintes partem dele.
    expect(opening.map((m) => m.balanceAfter)).toEqual([10]);
  });

  it("é idempotente: rodar de novo não muda nada", async () => {
    const parcial = await beer("parcial", 8);
    await prisma.stockMovement.create({
      data: { beerId: parcial.id, type: "SALE", quantity: -2, balanceAfter: 8 },
    });

    await prisma.$executeRawUnsafe(RECONCILE);
    const first = await prisma.stockMovement.count();
    await prisma.$executeRawUnsafe(RECONCILE);

    expect(await prisma.stockMovement.count()).toBe(first);
  });

  it("com vários movimentos, a abertura é o estoque menos a soma de todos e fica antes do primeiro", async () => {
    const many = await beer("varios", 20);
    const first = new Date("2026-11-20T10:00:00.000Z");
    for (const [i, quantity] of [-3, 5, -1].entries()) {
      await prisma.stockMovement.create({
        data: {
          beerId: many.id,
          type: quantity > 0 ? "ENTRY" : "LOSS",
          quantity,
          reason: "x",
          balanceAfter: 1,
          createdAt: new Date(first.getTime() + i * 60_000),
        },
      });
    }

    await prisma.$executeRawUnsafe(RECONCILE);

    const opening = await prisma.stockMovement.findFirstOrThrow({
      where: { beerId: many.id, reason: "Saldo inicial" },
    });
    expect(opening.quantity).toBe(19); // 20 - (-3 + 5 - 1) = 19
    expect(opening.createdAt.getTime()).toBeLessThan(first.getTime());
    expect((await sums()).find((r) => r.slug === "varios")?.total).toBe(20); // 19 + 1
  });

  it("se os movimentos somam mais que o estoque, a migration não inventa saída e a conferência acusa a cerveja", async () => {
    const odd = await beer("a-mais", 3);
    await prisma.stockMovement.create({
      data: { beerId: odd.id, type: "ENTRY", quantity: 10, reason: "x", balanceAfter: 10 },
    });

    await prisma.$executeRawUnsafe(RECONCILE);

    expect(await prisma.stockMovement.count({ where: { beerId: odd.id } })).toBe(1);
    const flagged = await prisma.$queryRaw<{ slug: string }[]>`
      SELECT b.slug FROM beers b LEFT JOIN stock_movements m ON m.beer_id = b.id
      GROUP BY b.id HAVING b.stock <> COALESCE(SUM(m.quantity), 0)`;
    expect(flagged.map((r) => r.slug)).toEqual(["a-mais"]);
  });
});

describe("procedimento manual do README para soma maior que o estoque (banco real)", () => {
  const prisma = new PrismaService();

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("o INSERT do README fecha a diferença sem tocar no estoque, e é o mesmo que a conferência acusava", async () => {
    const readme = readFileSync(new URL("../../../../README.md", import.meta.url), "utf-8");
    const block = /```sql\r?\n-- PROCEDIMENTO MANUAL[\s\S]*?\r?\n```/.exec(readme)?.[0] ?? "";
    const insert = /INSERT INTO[\s\S]*?;/.exec(block)?.[0] ?? "";
    expect(insert).not.toBe("");
    const category = await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } });
    const odd = await prisma.beer.create({
      data: {
        slug: "a-mais",
        name: "a-mais",
        style: "IPA",
        categoryId: category.id,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3000,
        stock: 3,
      },
    });
    await prisma.stockMovement.create({
      data: { beerId: odd.id, type: "ENTRY", quantity: 10, reason: "x", balanceAfter: 10 },
    });

    await prisma.$executeRawUnsafe(insert.replace("<ID_DA_CERVEJA>", odd.id));

    expect((await prisma.beer.findUniqueOrThrow({ where: { id: odd.id } })).stock).toBe(3);
    expect(
      await prisma.stockMovement.findFirstOrThrow({
        where: { beerId: odd.id, reason: "Reconciliação" },
      }),
    ).toMatchObject({
      type: "CORRECTION",
      quantity: -7,
      balanceAfter: 3,
    });
    const sum = await prisma.stockMovement.aggregate({
      where: { beerId: odd.id },
      _sum: { quantity: true },
    });
    expect(sum._sum.quantity).toBe(3);
  });
});
