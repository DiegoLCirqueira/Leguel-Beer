import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("regras do schema da Geladeira da conta (banco real)", () => {
  const prisma = new PrismaService();
  let profileId: string;
  let beerIds: string[];

  beforeEach(async () => {
    await resetDatabase(prisma);
    profileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
    const category = await prisma.category.create({
      data: { slug: "ipa", name: "IPAs", order: 1 },
    });
    beerIds = [];
    for (const slug of ["mare-alta", "ponta-verde", "cupuacu"]) {
      const beer = await prisma.beer.create({
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
        },
      });
      beerIds.push(beer.id);
    }
  });

  afterAll(() => prisma.onModuleDestroy());

  const item = (index: number, overrides: object = {}) => ({
    beerId: beerIds[index] as string,
    quantity: 2,
    seenPriceCents: 3200,
    position: index,
    ...overrides,
  });

  it("guarda a Geladeira do perfil com os itens, a quantidade, o preço visto e a posição de entrada", async () => {
    await prisma.fridge.create({
      data: {
        profileId,
        items: { create: [item(1, { position: 0 }), item(0, { position: 1, quantity: 3 })] },
      },
    });

    const fridge = await prisma.fridge.findUniqueOrThrow({
      where: { profileId },
      include: { items: { orderBy: { position: "asc" } } },
    });

    expect(fridge.items.map((i) => [i.beerId, i.quantity, i.seenPriceCents, i.position])).toEqual([
      [beerIds[1], 2, 3200, 0],
      [beerIds[0], 3, 3200, 1],
    ]);
  });

  it("recusa uma segunda Geladeira para o mesmo perfil", async () => {
    await prisma.fridge.create({ data: { profileId } });

    await expect(prisma.fridge.create({ data: { profileId } })).rejects.toThrow();
  });

  it.each([0, -1])(
    "recusa a quantidade %i: quantidade é sempre maior que zero",
    async (quantity) => {
      await expect(
        prisma.fridge.create({ data: { profileId, items: { create: [item(0, { quantity })] } } }),
      ).rejects.toThrow();
    },
  );

  it("recusa o preço visto negativo e aceita zero", async () => {
    await expect(
      prisma.fridge.create({
        data: { profileId, items: { create: [item(0, { seenPriceCents: -1 })] } },
      }),
    ).rejects.toThrow();

    await prisma.fridge.create({
      data: { profileId, items: { create: [item(0, { seenPriceCents: 0 })] } },
    });
  });

  it("recusa a mesma cerveja duas vezes e a mesma posição duas vezes na mesma Geladeira", async () => {
    await expect(
      prisma.fridge.create({
        data: { profileId, items: { create: [item(0), item(0, { position: 1 })] } },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.fridge.create({
        data: { profileId, items: { create: [item(0), item(1, { position: 0 })] } },
      }),
    ).rejects.toThrow();
  });

  it("apagar o perfil apaga a Geladeira e os itens; apagar cerveja que está numa Geladeira é recusado", async () => {
    await prisma.fridge.create({ data: { profileId, items: { create: [item(0)] } } });

    await expect(prisma.beer.delete({ where: { id: beerIds[0] as string } })).rejects.toThrow();

    await prisma.profile.delete({ where: { id: profileId } });
    expect(await prisma.fridge.count()).toBe(0);
    expect(await prisma.fridgeItem.count()).toBe(0);
  });
});
