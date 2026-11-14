import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaService } from "../../../common/prisma/prisma.service.js";
import { resetDatabase } from "../../../common/testing/database.js";
import { AddressOwnerNotFoundError } from "../domain/address-repository.js";
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

  it("troca o endereço padrão numa gravação só, sem ferir o índice de padrão único", async () => {
    const casa = anAddress({ id: crypto.randomUUID(), ownerId, isDefault: true, createdAt: at(8) });
    const trabalho = anAddress({ id: crypto.randomUUID(), ownerId, createdAt: at(9) });
    await save(ownerId, casa, trabalho);

    // O novo padrão vem primeiro na gravação: sem limpar o padrão antigo antes, o índice único recusaria.
    await save(ownerId, { ...trabalho, isDefault: true }, { ...casa, isDefault: false });

    expect((await addresses.list(ownerId)).map(({ id, isDefault }) => ({ id, isDefault }))).toEqual(
      [
        { id: casa.id, isDefault: false },
        { id: trabalho.id, isDefault: true },
      ],
    );
  });

  it("remove do banco os endereços que saíram da lista gravada", async () => {
    const casa = anAddress({ id: crypto.randomUUID(), ownerId, isDefault: true, createdAt: at(8) });
    const trabalho = anAddress({ id: crypto.randomUUID(), ownerId, createdAt: at(9) });
    await save(ownerId, casa, trabalho);

    await save(ownerId, { ...trabalho, isDefault: true });

    expect((await addresses.list(ownerId)).map(({ id }) => id)).toEqual([trabalho.id]);
  });

  it("nunca lê nem altera os endereços de outro cliente", async () => {
    const mine = anAddress({ id: crypto.randomUUID(), ownerId, isDefault: true });
    const theirs = anAddress({
      id: crypto.randomUUID(),
      ownerId: otherOwnerId,
      isDefault: true,
      street: "Rua do Outro",
    });
    await save(otherOwnerId, theirs);

    await save(ownerId, mine);
    await save(ownerId);

    expect(await addresses.list(ownerId)).toEqual([]);
    expect(await addresses.list(otherOwnerId)).toEqual([theirs]);
  });

  it("recusa gravar para a conta que ainda não tem perfil, sem erro de banco", async () => {
    const noProfile = crypto.randomUUID();

    await expect(
      save(noProfile, anAddress({ id: crypto.randomUUID(), ownerId: noProfile })),
    ).rejects.toBeInstanceOf(AddressOwnerNotFoundError);

    expect(await addresses.list(noProfile)).toEqual([]);
  });

  it("uma falha no meio da gravação não deixa nada gravado: a lista anterior continua como estava", async () => {
    const casa = anAddress({ id: crypto.randomUUID(), ownerId, isDefault: true, createdAt: at(8) });
    const trabalho = anAddress({ id: crypto.randomUUID(), ownerId, createdAt: at(9) });
    await save(ownerId, casa, trabalho);
    // O CHECK de UF do banco recusa o último endereço, depois de o primeiro já ter sido gravado.
    const invalid = anAddress({ id: crypto.randomUUID(), ownerId, createdAt: at(10) });

    await expect(
      save(ownerId, { ...trabalho, isDefault: true }, { ...invalid, state: "SP" as "AL" }),
    ).rejects.toThrow();

    expect(await addresses.list(ownerId)).toEqual([casa, trabalho]);
  });

  it("recusa gravar um id que já é de outro cliente, sem tocar na linha dele", async () => {
    const theirs = anAddress({
      id: crypto.randomUUID(),
      ownerId: otherOwnerId,
      isDefault: true,
      street: "Rua do Outro",
    });
    await save(otherOwnerId, theirs);

    await expect(
      save(ownerId, anAddress({ id: theirs.id, ownerId, isDefault: true, street: "Roubada" })),
    ).rejects.toThrow();

    expect(await addresses.list(otherOwnerId)).toEqual([theirs]);
    expect(await addresses.list(ownerId)).toEqual([]);
  });
});
