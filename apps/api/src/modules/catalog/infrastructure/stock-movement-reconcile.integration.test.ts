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
});
