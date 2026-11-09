import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { seedCatalog } from "./seed-catalog.js";

describe("seedCatalog (banco real)", () => {
  const prisma = new PrismaService();

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.onModuleDestroy();
  });

  it("cria as 4 categorias na ordem IPA, Frutas, Malt, Lager e 4 cervejas em cada uma", async () => {
    await seedCatalog(prisma);

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { beers: true } } },
    });
    expect(categories.map((c) => [c.slug, c.name, c.order, c._count.beers])).toEqual([
      ["ipa", "IPAs", 1, 4],
      ["frutas", "Frutas", 2, 4],
      ["malt", "Malt", 3, 4],
      ["lager", "Lager", 4, 4],
    ]);
    expect(await prisma.beer.count()).toBe(16);
  });

  it("pode rodar de novo sem duplicar nem falhar", async () => {
    await seedCatalog(prisma);
    await expect(seedCatalog(prisma)).resolves.toBeUndefined();

    expect(await prisma.category.count()).toBe(4);
    expect(await prisma.beer.count()).toBe(16);
  });

  it("recusa rodar contra um banco que não é local, sem criar nada", async () => {
    const attempt = seedCatalog(prisma, {
      DATABASE_URL: "postgresql://u:p@db.abc.supabase.co:5432/postgres",
    });

    await expect(attempt).rejects.toThrow(/DATABASE_URL.*local/);
    expect(await prisma.category.count()).toBe(0);
  });

  it("não toca em perfis: o admin do seed de contas continua igual", async () => {
    const admin = await prisma.profile.create({
      data: { id: randomUUID(), email: "admin@leguele.test", role: "ADMIN" },
    });

    await seedCatalog(prisma);
    await seedCatalog(prisma);

    expect(await prisma.profile.findMany()).toEqual([admin]);
  });

  it("recusa rodar sem DATABASE_URL: sem saber o banco, não cria nada", async () => {
    const attempt = seedCatalog(prisma, {});

    await expect(attempt).rejects.toThrow(/DATABASE_URL/);
    expect(await prisma.category.count()).toBe(0);
  });

  it("grava a descrição e o preço anterior: Maré Alta com 36,90, Umbu Gose sem preço anterior", async () => {
    await seedCatalog(prisma);

    const mareAlta = await prisma.beer.findUniqueOrThrow({ where: { slug: "mare-alta" } });
    const umbu = await prisma.beer.findUniqueOrThrow({ where: { slug: "umbu-gose" } });

    expect(mareAlta).toMatchObject({ priceCents: 3200, previousPriceCents: 3690 });
    expect(mareAlta.description).toMatch(/^Uma American IPA de respeito!/);
    expect(umbu.previousPriceCents).toBeNull();
    expect(umbu.description).toBeTruthy();
  });

  it("deixa o banco local com exatamente as 16 do seed: remove as de rodadas anteriores", async () => {
    const lager = await prisma.category.create({
      data: { slug: "lager", name: "Lager", order: 4 },
    });
    const base = {
      style: "x",
      abv: 5,
      ibu: 10,
      volumeMl: 500,
      priceCents: 2500,
      categoryId: lager.id,
    };
    await prisma.beer.createMany({
      data: [
        { slug: "teste-lager-1", name: "Teste Lager 1", ...base },
        { slug: "cajupa", name: "Cajupá", ...base },
        { slug: "leguele-cream-ale", name: "Antiga", ...base },
      ],
    });

    await seedCatalog(prisma);

    const slugs = (await prisma.beer.findMany({ select: { slug: true } })).map((b) => b.slug);
    expect(slugs).toHaveLength(16);
    expect(slugs).not.toContain("teste-lager-1");
    expect(slugs).not.toContain("cajupa");
    expect(
      await prisma.beer.findUniqueOrThrow({ where: { slug: "leguele-cream-ale" } }),
    ).toMatchObject({
      name: "Leguelé Cream Ale",
    });
  });
});
