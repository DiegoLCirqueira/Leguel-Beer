import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { PrismaOrderReader } from "./prisma-order-reader.js";

const T0 = new Date("2026-11-27T14:00:00.000Z");

describe("PrismaOrderReader (banco real)", () => {
  const prisma = new PrismaService();
  const reader = new PrismaOrderReader(prisma);
  let ana: string;
  let bruno: string;
  let beerA: string;
  let beerB: string;
  let seq = 0;

  beforeEach(async () => {
    await resetDatabase(prisma);
    seq = 0;
    ana = (await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } }))
      .id;
    bruno = (await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "b@x.test" } }))
      .id;
    const category = await prisma.category.create({
      data: { slug: "ipa", name: "IPAs", order: 1 },
    });
    const beer = (name: string, slug: string) =>
      prisma.beer
        .create({
          data: {
            slug,
            name,
            style: "American IPA",
            categoryId: category.id,
            abv: 5,
            ibu: 30,
            volumeMl: 500,
            priceCents: 2000,
            stock: 50,
          },
        })
        .then((b) => b.id);
    beerA = await beer("Maré Alta", "mare-alta");
    beerB = await beer("Brisa Leve", "brisa-leve");
  });

  afterAll(() => prisma.onModuleDestroy());

  /** Cria o pedido direto no banco, sem passar pelo checkout. */
  async function createOrder(
    profileId: string,
    createdAt: Date,
    extra: {
      status?: "AWAITING_PAYMENT" | "PAID" | "CANCELLED";
      id?: string;
      history?: { to: "AWAITING_PAYMENT" | "PAID"; at: Date }[];
    } = {},
  ) {
    seq += 1;
    return prisma.order.create({
      data: {
        id: extra.id,
        number: `#LB${String(seq).padStart(6, "0")}`,
        profileId,
        status: extra.status ?? "PAID",
        paymentMethod: "PIX",
        subtotalCents: 6000,
        shippingCents: 1290,
        totalCents: 7290,
        expiresAt: new Date(createdAt.getTime() + 30 * 60_000),
        cancelReason: "motivo interno",
        customerName: "Ana Souza",
        customerPhone: "82999990000",
        shipZip: "57035000",
        shipStreet: "Rua do Sol",
        shipNumber: "100",
        shipDistrict: "Farol",
        shipCity: "Maceió",
        shipState: "AL",
        createdAt,
        items: {
          create: [
            { beerId: beerB, name: "Brisa Leve", unitPriceCents: 2000, quantity: 1 },
            { beerId: beerA, name: "Maré Alta", unitPriceCents: 2000, quantity: 2 },
          ],
        },
        statusHistory: {
          create: (extra.history ?? [{ to: "AWAITING_PAYMENT", at: createdAt }]).map((h) => ({
            toStatus: h.to,
            createdAt: h.at,
            reason: "motivo interno",
          })),
        },
      },
    });
  }

  it("lista só os pedidos do cliente, do mais recente ao mais antigo, com quantidade de itens e nomes", async () => {
    const old = await createOrder(ana, T0);
    await createOrder(bruno, new Date(T0.getTime() + 30_000));
    const recent = await createOrder(ana, new Date(T0.getTime() + 60_000));

    const rows = await reader.listOwned(ana, { after: null, limit: 20 });

    expect(rows.map((r) => r.id)).toEqual([recent.id, old.id]);
    expect(rows[0]).toMatchObject({
      status: "pago",
      itemCount: 3,
      beerNames: ["Brisa Leve", "Maré Alta"],
      totalCents: 7290,
    });
  });
});
