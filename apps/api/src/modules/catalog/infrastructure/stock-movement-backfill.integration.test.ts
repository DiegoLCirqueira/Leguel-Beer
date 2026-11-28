import { readFileSync } from "node:fs";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

const BACKFILL = readFileSync(
  new URL(
    "../../../../prisma/migrations/20261128140000_stock_movements_backfill/migration.sql",
    import.meta.url,
  ),
  "utf-8",
);

describe("preenchimento do histórico de estoque das cervejas existentes (banco real)", () => {
  const prisma = new PrismaService();

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  it("cada cerveja com estoque ganha o movimento 'Saldo inicial' igual ao estoque atual; sem estoque, nada", async () => {
    const category = await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } });
    const make = (slug: string, stock: number) =>
      prisma.beer.create({
        data: {
          slug,
          name: slug,
          style: "IPA",
          categoryId: category.id,
          abv: 5,
          ibu: 30,
          volumeMl: 500,
          priceCents: 3000,
          stock,
        },
      });
    const withStock = await make("com-estoque", 12);
    const empty = await make("sem-estoque", 0);

    await prisma.$executeRawUnsafe(BACKFILL);

    expect(await prisma.stockMovement.findMany({ where: { beerId: withStock.id } })).toMatchObject([
      { type: "ENTRY", quantity: 12, reason: "Saldo inicial", balanceAfter: 12, actorId: null },
    ]);
    expect(await prisma.stockMovement.count({ where: { beerId: empty.id } })).toBe(0);
  });

  it("não duplica: a cerveja que já tem movimentos fica como está", async () => {
    const category = await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } });
    const beer = await prisma.beer.create({
      data: {
        slug: "a",
        name: "a",
        style: "IPA",
        categoryId: category.id,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3000,
        stock: 5,
      },
    });
    await prisma.stockMovement.create({
      data: {
        beerId: beer.id,
        type: "ENTRY",
        quantity: 5,
        reason: "Entrada inicial",
        balanceAfter: 5,
      },
    });

    await prisma.$executeRawUnsafe(BACKFILL);

    expect(await prisma.stockMovement.count({ where: { beerId: beer.id } })).toBe(1);
  });
});
