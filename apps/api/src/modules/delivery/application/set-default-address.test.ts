import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { anAddress } from "../testing/factories.js";
import { InMemoryAddressRepository } from "../testing/in-memory-addresses.js";
import { SetDefaultAddress } from "./set-default-address.js";

describe("SetDefaultAddress", () => {
  it("troca o padrão: o escolhido passa a ser o único padrão", async () => {
    const addresses = new InMemoryAddressRepository();
    await addresses.update("owner-1", () => ({
      addresses: [
        anAddress({ id: "casa", isDefault: true }),
        anAddress({ id: "trabalho", isDefault: false }),
      ],
      result: undefined,
    }));

    await new SetDefaultAddress(addresses).execute("owner-1", "trabalho");

    expect(
      (await addresses.list("owner-1")).map(({ id, isDefault }) => ({ id, isDefault })),
    ).toEqual([
      { id: "casa", isDefault: false },
      { id: "trabalho", isDefault: true },
    ]);
  });
});
