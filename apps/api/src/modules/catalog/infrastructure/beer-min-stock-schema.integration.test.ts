import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("estoque mínimo da cerveja (banco real)", () => {
  const prisma = new PrismaService();

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  const beerData = (categoryId: string, extra: object = {}) => ({
    slug: "mare-alta",
    name: "Maré Alta",
    style: "American IPA",
    categoryId,
    abv: 5,
    ibu: 30,
    volumeMl: 500,
    priceCents: 3200,
    ...extra,
  });

  it("o mínimo padrão é 6 e pode ser definido por cerveja", async () => {
    const category = await prisma.category.create({
      data: { slug: "ipa", name: "IPAs", order: 1 },
    });

    const padrao = await prisma.beer.create({ data: beerData(category.id) });
    const proprio = await prisma.beer.create({
      data: beerData(category.id, { slug: "outra", name: "Outra", minStock: 2 }),
    });

    expect(padrao.minStock).toBe(6);
    expect(proprio.minStock).toBe(2);
  });
});
