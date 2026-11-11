import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { FridgeOwnerNotFoundError } from "../domain/account-fridge-repository.js";
import { PrismaAccountFridgeRepository } from "./prisma-account-fridge-repository.js";

describe("PrismaAccountFridgeRepository (banco real)", () => {
  const prisma = new PrismaService();
  const repository = new PrismaAccountFridgeRepository(prisma);
  let profileId: string;
  let otherProfileId: string;
  let beerIds: string[];

  beforeEach(async () => {
    await resetDatabase(prisma);
    profileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
    otherProfileId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "b@x.test" } })
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

  const stored = (index: number, quantity = 1) => ({
    beerId: beerIds[index] as string,
    quantity,
    seenPriceCents: 3200,
  });

  it("guarda os itens e os devolve na ordem de entrada, não na do id", async () => {
    await repository.replace(profileId, [stored(2), stored(0, 3), stored(1)]);

    expect(await repository.find(profileId)).toEqual([stored(2), stored(0, 3), stored(1)]);
  });
});
