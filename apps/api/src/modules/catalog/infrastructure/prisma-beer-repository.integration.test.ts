import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
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

  it("tem um teto de segurança de 200 cervejas por leitura (o catálogo do MVP tem 16)", async () => {
    const ipa = await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } });
    await prisma.beer.createMany({
      data: Array.from({ length: 201 }, (_, index) => ({
        slug: `cerveja-${String(index).padStart(3, "0")}`,
        name: `Cerveja ${index}`,
        style: "American IPA",
        categoryId: ipa.id,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 2800,
        stock: 1,
      })),
    });

    const beers = await repository.findActive();

    expect(beers).toHaveLength(200);
  });

  it("avisa no log quando a leitura bate o teto, porque o catálogo pode estar truncado", async () => {
    const ipa = await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } });
    await prisma.beer.createMany({
      data: Array.from({ length: 201 }, (_, index) => ({
        slug: `cerveja-${String(index).padStart(3, "0")}`,
        name: `Cerveja ${index}`,
        style: "American IPA",
        categoryId: ipa.id,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 2800,
        stock: 1,
      })),
    });
    const logger = { warn: vi.fn() };

    await new PrismaBeerRepository(prisma, logger).findActive();

    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("200"));
  });

  it("não avisa quando a leitura fica abaixo do teto", async () => {
    const ipa = await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } });
    await prisma.beer.create({
      data: {
        slug: "ipa-a",
        name: "IPA A",
        style: "American IPA",
        categoryId: ipa.id,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 2800,
        stock: 1,
      },
    });
    const logger = { warn: vi.fn() };

    await new PrismaBeerRepository(prisma, logger).findActive();

    expect(logger.warn).not.toHaveBeenCalled();
  });
});
