import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";

describe("movimentos de estoque (banco real)", () => {
  const prisma = new PrismaService();
  let beerId: string;

  beforeEach(async () => {
    await resetDatabase(prisma);
    const category = await prisma.category.create({ data: { slug: "ipa", name: "IPA", order: 1 } });
    beerId = (
      await prisma.beer.create({
        data: {
          slug: "mare-alta",
          name: "Maré Alta",
          style: "IPA",
          categoryId: category.id,
          abv: 5,
          ibu: 30,
          volumeMl: 500,
          priceCents: 3000,
          stock: 10,
        },
      })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  const movement = (extra: object = {}) => ({
    beerId,
    type: "ENTRY" as const,
    quantity: 5,
    reason: "Produção",
    balanceAfter: 15,
    ...extra,
  });

  it("guarda o movimento com tipo, quantidade com sinal, motivo e saldo", async () => {
    const saved = await prisma.stockMovement.create({ data: movement() });

    expect(saved).toMatchObject({
      type: "ENTRY",
      quantity: 5,
      reason: "Produção",
      balanceAfter: 15,
    });
    expect(saved.orderId).toBeNull();
  });

  it("recusa movimento de quantidade zero e saldo negativo", async () => {
    await expect(
      prisma.stockMovement.create({ data: movement({ quantity: 0 }) }),
    ).rejects.toThrow();
    await expect(
      prisma.stockMovement.create({ data: movement({ balanceAfter: -1 }) }),
    ).rejects.toThrow();
  });

  it("a cerveja com movimentos não pode ser apagada (Restrict)", async () => {
    await prisma.stockMovement.create({ data: movement() });

    await expect(prisma.beer.delete({ where: { id: beerId } })).rejects.toThrow();
  });
});
