import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaService } from "../../../common/prisma/prisma.service.js";

describe("regras do schema do catálogo (banco real)", () => {
  const prisma = new PrismaService();

  const beer = (categoryId: string, overrides: object = {}) => ({
    slug: "ipa-aratu",
    name: "IPA Aratu",
    style: "American IPA",
    categoryId,
    abv: 6.5,
    ibu: 55,
    volumeMl: 500,
    priceCents: 3200,
    stock: 12,
    ...overrides,
  });

  let categoryId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    categoryId = (await prisma.category.create({ data: { slug: "ipa", name: "IPAs", order: 1 } }))
      .id;
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it("guarda a cerveja com os padrões: inativa não, em destaque não, data de cadastro agora", async () => {
    const created = await prisma.beer.create({ data: beer(categoryId) });

    expect(created).toMatchObject({ featured: false, active: true, imageUrl: null });
    expect(Number(created.abv)).toBe(6.5);
    expect(Date.now() - created.createdAt.getTime()).toBeLessThan(10_000);
  });

  it("recusa slug repetido de categoria e de cerveja", async () => {
    await prisma.beer.create({ data: beer(categoryId) });

    await expect(
      prisma.category.create({ data: { slug: "ipa", name: "Outra", order: 2 } }),
    ).rejects.toThrow();
    await expect(prisma.beer.create({ data: beer(categoryId) })).rejects.toThrow();
  });

  it("recusa apagar categoria que ainda tem cervejas", async () => {
    await prisma.beer.create({ data: beer(categoryId) });

    await expect(prisma.category.delete({ where: { id: categoryId } })).rejects.toThrow();
    expect(await prisma.beer.count()).toBe(1);
  });

  it("recusa preço ou estoque negativo direto no banco", async () => {
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "a", priceCents: -1 }) }),
    ).rejects.toThrow();
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "b", stock: -1 }) }),
    ).rejects.toThrow();
  });

  it("recusa teor negativo, IBU negativo e volume zero direto no banco", async () => {
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "c", abv: -0.1 }) }),
    ).rejects.toThrow();
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "d", ibu: -1 }) }),
    ).rejects.toThrow();
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "e", volumeMl: 0 }) }),
    ).rejects.toThrow();
  });

  it("recusa preço anterior negativo, descrição vazia e o slug reservado 'destaques'", async () => {
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "f", previousPriceCents: -1 }) }),
    ).rejects.toThrow();
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "g", description: "" }) }),
    ).rejects.toThrow();
    await expect(
      prisma.beer.create({ data: beer(categoryId, { slug: "destaques" }) }),
    ).rejects.toThrow();
  });

  it("aceita cerveja sem descrição nem preço anterior e com os dois preenchidos", async () => {
    const sem = await prisma.beer.create({ data: beer(categoryId, { slug: "sem" }) });
    const com = await prisma.beer.create({
      data: beer(categoryId, {
        slug: "com",
        description: "Uma IPA cítrica.",
        previousPriceCents: 3690,
      }),
    });

    expect(sem).toMatchObject({ description: null, previousPriceCents: null });
    expect(com).toMatchObject({ description: "Uma IPA cítrica.", previousPriceCents: 3690 });
  });
});
