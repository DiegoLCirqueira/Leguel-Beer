import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaFridgeBeerLookup } from "./prisma-fridge-beer-lookup.js";

describe("PrismaFridgeBeerLookup (banco real)", () => {
  const prisma = new PrismaService();
  const lookup = new PrismaFridgeBeerLookup(prisma);

  beforeEach(() => resetDatabase(prisma));
  afterAll(() => prisma.onModuleDestroy());

  const addBeer = async (slug: string, overrides: object = {}) => {
    const category = await prisma.category.upsert({
      where: { slug: "ipa" },
      update: {},
      create: { slug: "ipa", name: "IPAs", order: 1 },
    });
    return prisma.beer.create({
      data: {
        slug,
        name: slug,
        style: "American IPA",
        categoryId: category.id,
        abv: 5,
        ibu: 30,
        volumeMl: 500,
        priceCents: 3200,
        stock: 10,
        ...overrides,
      },
    });
  };

  it("devolve as cervejas pedidas, ativas ou desativadas, com a situação de cada uma", async () => {
    const ativa = await addBeer("mare-alta");
    const desativada = await addBeer("ponta-verde", { active: false });
    await addBeer("outra");

    const found = await lookup.findByIds([ativa.id, desativada.id]);

    expect(found.map(({ beer, active }) => [beer.slug, active]).sort()).toEqual([
      ["mare-alta", true],
      ["ponta-verde", false],
    ]);
    expect(found[0]?.beer.category).toEqual({ slug: "ipa", name: "IPAs", order: 1 });
  });

  it("ignora o id que não é UUID e o UUID sem cerveja, sem erro, e devolve as demais", async () => {
    const ativa = await addBeer("mare-alta");

    const found = await lookup.findByIds([
      "nao-sou-uuid",
      "00000000-0000-4000-8000-000000000000",
      ativa.id,
      "",
      "' OR 1=1 --",
    ]);

    expect(found.map(({ beer }) => beer.slug)).toEqual(["mare-alta"]);
  });
});
