import { describe, expect, it } from "vitest";
import type { DeliverySettings } from "../domain/delivery-settings-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import type { FridgeSubtotalProvider } from "../domain/fridge-subtotal.js";
import { anAddress, ORIGIN } from "../testing/factories.js";
import { FakeRouteCalculator } from "../testing/fake-maps.js";
import { InMemoryAddressRepository } from "../testing/in-memory-addresses.js";
import { QuoteShipping } from "./quote-shipping.js";

const SETTINGS: DeliverySettings = {
  taxaBaseCentavos: 500,
  valorPorKmCentavos: 150,
  raioMaximoMetros: 25_000,
  freteGratisMinimoCentavos: 15_000,
  origem: ORIGIN,
};

async function setup(options: {
  distanceMeters: number | null;
  subtotalCents: number;
  settings?: DeliverySettings;
  routeOrigin?: { latitude: number; longitude: number };
}) {
  const addresses = new InMemoryAddressRepository();
  await addresses.update("owner-1", () => ({
    addresses: [
      anAddress({
        id: "casa",
        isDefault: true,
        distanceMeters: options.distanceMeters,
        routeOrigin: options.routeOrigin ?? ORIGIN,
      }),
    ],
    result: undefined,
  }));
  const settingsRepository: DeliverySettingsRepository = {
    get: async () => options.settings ?? SETTINGS,
  };
  const router = new FakeRouteCalculator(8_000);
  const subtotal: FridgeSubtotalProvider = { subtotalCents: async () => options.subtotalCents };
  return {
    addresses,
    router,
    quote: new QuoteShipping(addresses, settingsRepository, router, subtotal),
  };
}

describe("QuoteShipping", () => {
  it("cota o frete do endereço: 5,2 km com subtotal de R$ 90,50 dá R$ 13,00", async () => {
    const { quote } = await setup({ distanceMeters: 5_200, subtotalCents: 9_050 });

    expect(await quote.execute("owner-1", "casa")).toEqual({
      naArea: true,
      freteCentavos: 1_300,
      gratis: false,
    });
  });
});
