import { describe, expect, it } from "vitest";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import { anAddress, ORIGIN } from "../testing/factories.js";
import { InMemoryAddressRepository } from "../testing/in-memory-addresses.js";
import { ListAddresses } from "./list-addresses.js";

const settings: DeliverySettingsRepository = {
  get: async () => ({
    taxaBaseCentavos: 500,
    valorPorKmCentavos: 150,
    raioMaximoMetros: 25_000,
    freteGratisMinimoCentavos: 15_000,
    origem: ORIGIN,
  }),
};

async function listWith(...stored: ReturnType<typeof anAddress>[]) {
  const addresses = new InMemoryAddressRepository();
  await addresses.update("owner-1", () => ({ addresses: stored, result: undefined }));
  return new ListAddresses(addresses, settings).execute("owner-1");
}

describe("ListAddresses", () => {
  it.each([
    ["dentro do raio", 5_200, false],
    ["exatamente no raio (25 km, inclusive)", 25_000, false],
    ["1 m além do raio", 25_001, true],
    ["sem rota", null, true],
  ])("marca o endereço %s", async (_name, distanceMeters, outsideArea) => {
    const [item] = await listWith(anAddress({ distanceMeters }));

    expect(item?.outsideArea).toBe(outsideArea);
  });
});
