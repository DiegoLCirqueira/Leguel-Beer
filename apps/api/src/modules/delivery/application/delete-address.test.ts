import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { anAddress } from "../testing/factories.js";
import { InMemoryAddressRepository } from "../testing/in-memory-addresses.js";
import { DeleteAddress } from "./delete-address.js";

async function repositoryWith(...stored: ReturnType<typeof anAddress>[]) {
  const addresses = new InMemoryAddressRepository();
  await addresses.update("owner-1", () => ({ addresses: stored, result: undefined }));
  return addresses;
}

const at = (hour: number) => new Date(`2026-11-14T${String(hour).padStart(2, "0")}:00:00.000Z`);

describe("DeleteAddress", () => {
  it("excluir o padrão torna padrão o endereço salvo mais recentemente", async () => {
    const addresses = await repositoryWith(
      anAddress({ id: "casa", isDefault: true, createdAt: at(8) }),
      anAddress({ id: "trabalho", createdAt: at(9) }),
      anAddress({ id: "sitio", createdAt: at(10) }),
    );

    await new DeleteAddress(addresses).execute("owner-1", "casa");

    expect(
      (await addresses.list("owner-1")).map(({ id, isDefault }) => ({ id, isDefault })),
    ).toEqual([
      { id: "trabalho", isDefault: false },
      { id: "sitio", isDefault: true },
    ]);
  });

  it("excluir o último endereço deixa a lista vazia", async () => {
    const addresses = await repositoryWith(anAddress({ id: "casa", isDefault: true }));

    await new DeleteAddress(addresses).execute("owner-1", "casa");

    expect(await addresses.list("owner-1")).toEqual([]);
  });

  it("excluir um endereço que não é o padrão mantém o padrão, mesmo havendo um mais recente", async () => {
    const addresses = await repositoryWith(
      anAddress({ id: "casa", isDefault: true, createdAt: at(8) }),
      anAddress({ id: "trabalho", createdAt: at(9) }),
      anAddress({ id: "sitio", createdAt: at(10) }),
    );

    await new DeleteAddress(addresses).execute("owner-1", "trabalho");

    expect(
      (await addresses.list("owner-1")).map(({ id, isDefault }) => ({ id, isDefault })),
    ).toEqual([
      { id: "casa", isDefault: true },
      { id: "sitio", isDefault: false },
    ]);
  });

  it("responde não encontrado para o endereço de outro cliente ou inexistente, sem apagar nada", async () => {
    const addresses = await repositoryWith(anAddress({ id: "casa", isDefault: true }));
    await addresses.update("owner-2", () => ({
      addresses: [anAddress({ id: "do-outro", ownerId: "owner-2", isDefault: true })],
      result: undefined,
    }));
    const remove = new DeleteAddress(addresses);

    await expect(remove.execute("owner-1", "do-outro")).rejects.toBeInstanceOf(NotFoundError);
    await expect(remove.execute("owner-1", "nao-existe")).rejects.toBeInstanceOf(NotFoundError);

    expect(await addresses.list("owner-1")).toHaveLength(1);
    expect(await addresses.list("owner-2")).toHaveLength(1);
  });
});
