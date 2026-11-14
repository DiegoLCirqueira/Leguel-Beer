import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { AddAddress } from "../application/add-address.js";
import { AddressLimitReachedError } from "../domain/address-errors.js";
import { ORIGIN } from "../testing/factories.js";
import { FakeGeocoder, FakeRouteCalculator } from "../testing/fake-maps.js";
import { PrismaAddressRepository } from "./prisma-address-repository.js";

describe("endereços com várias requisições juntas (banco real)", () => {
  const prisma = new PrismaService();
  const addresses = new PrismaAddressRepository(prisma);
  let ownerId: string;

  const settings = {
    get: async () => ({
      taxaBaseCentavos: 500,
      valorPorKmCentavos: 150,
      raioMaximoMetros: 25_000,
      freteGratisMinimoCentavos: 15_000,
      origem: ORIGIN,
    }),
  };

  const addAddress = () =>
    new AddAddress(
      addresses,
      new FakeGeocoder(),
      new FakeRouteCalculator(),
      settings,
      () => crypto.randomUUID(),
      () => new Date(),
    );

  beforeEach(async () => {
    await resetDatabase(prisma);
    ownerId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  it("8 salvamentos simultâneos gravam exatamente 5, com um só padrão; os outros 3 recebem o limite", async () => {
    const input = {
      zip: "57035000",
      street: "Rua do Sol",
      number: "100",
      district: "Farol",
      city: "Maceió",
      state: "AL",
    } as const;

    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => addAddress().execute(ownerId, input)),
    );

    const rejected = results.filter((r) => r.status === "rejected");
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(5);
    expect(rejected).toHaveLength(3);
    for (const failure of rejected) {
      expect((failure as PromiseRejectedResult).reason).toBeInstanceOf(AddressLimitReachedError);
    }
    const saved = await addresses.list(ownerId);
    expect(saved).toHaveLength(5);
    expect(saved.filter((a) => a.isDefault)).toHaveLength(1);
  });
});
