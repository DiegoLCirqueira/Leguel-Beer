import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { anAddress } from "../testing/factories.js";
import { PrismaAddressRepository } from "./prisma-address-repository.js";

describe("PrismaAddressRepository (banco real)", () => {
  const prisma = new PrismaService();
  const addresses = new PrismaAddressRepository(prisma);
  let ownerId: string;
  let otherOwnerId: string;

  const at = (hour: number) => new Date(`2026-11-14T${String(hour).padStart(2, "0")}:00:00.000Z`);

  const save = (owner: string, ...list: ReturnType<typeof anAddress>[]) =>
    addresses.update(owner, () => ({ addresses: list, result: undefined }));

  beforeEach(async () => {
    await resetDatabase(prisma);
    ownerId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "a@x.test" } })
    ).id;
    otherOwnerId = (
      await prisma.profile.create({ data: { id: crypto.randomUUID(), email: "b@x.test" } })
    ).id;
  });

  afterAll(() => prisma.onModuleDestroy());

  it("guarda e devolve o endereço inteiro, com opcionais ausentes e sem rota", async () => {
    const address = anAddress({
      id: crypto.randomUUID(),
      ownerId,
      isDefault: true,
      distanceMeters: null,
      createdAt: at(9),
    });

    await save(ownerId, address);

    expect(await addresses.list(ownerId)).toEqual([address]);
  });
});
