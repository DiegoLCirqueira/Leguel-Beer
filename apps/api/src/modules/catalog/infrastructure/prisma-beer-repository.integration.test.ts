import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaBeerRepository } from "./prisma-beer-repository.js";

describe("PrismaBeerRepository (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaBeerRepository(prisma);

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  const beerData = (categoryId: string, overrides: object = {}) => ({
    slug: "ipa-aratu",
    name: "IPA Aratu",
    style: "American IPA",
    categoryId,
    abv: 6.5,
    ibu: 55,
    volumeMl: 500,
    priceCents: 3200,
    stock: 12,
    featured: true,
    createdAt: new Date("2026-10-02T12:00:00Z"),
    ...overrides,
  });

  it("devolve só as cervejas ativas, com a categoria e os campos no formato do domínio", async () => {
    const ipa = await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } });
    await prisma.beer.create({ data: beerData(ipa.id) });
    await prisma.beer.create({ data: beerData(ipa.id, { slug: "ipa-velha", active: false }) });

    const beers = await repository.findActive();

    expect(beers).toEqual([
      {
        id: expect.any(String),
        slug: "ipa-aratu",
        name: "IPA Aratu",
        style: "American IPA",
        category: { slug: "ipa", name: "IPAs", order: 1 },
        abv: 6.5,
        ibu: 55,
        volumeMl: 500,
        priceCents: 3200,
        featured: true,
        stock: 12,
        imageUrl: null,
        createdAt: new Date("2026-10-02T12:00:00Z"),
      },
    ]);
  });
});
