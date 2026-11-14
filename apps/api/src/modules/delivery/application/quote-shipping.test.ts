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

  it.each([
    [
      "5,2 km, R$ 149,99: ainda paga",
      5_200,
      14_999,
      { naArea: true, freteCentavos: 1_300, gratis: false },
    ],
    [
      "5,2 km, R$ 150,00: grátis (inclusive)",
      5_200,
      15_000,
      { naArea: true, freteCentavos: 0, gratis: true },
    ],
    [
      "25 km, R$ 90,50: R$ 42,50 (raio inclusive)",
      25_000,
      9_050,
      { naArea: true, freteCentavos: 4_250, gratis: false },
    ],
    ["25,001 km: fora da área", 25_001, 9_050, { naArea: false }],
    ["25,001 km mesmo com frete grátis: fora da área", 25_001, 20_000, { naArea: false }],
    ["sem rota até a cervejaria: fora da área", null, 9_050, { naArea: false }],
  ])("%s", async (_nome, distanceMeters, subtotalCents, expected) => {
    const { quote } = await setup({ distanceMeters, subtotalCents });

    expect(await quote.execute("owner-1", "casa")).toEqual(expected);
  });

  it("origem mudada: recalcula a distância na própria cotação, usa a nova e a guarda com a origem usada", async () => {
    const newOrigin = { latitude: -9.7, longitude: -35.8 };
    const { addresses, router, quote } = await setup({
      distanceMeters: 5_200,
      subtotalCents: 9_050,
      settings: { ...SETTINGS, origem: newOrigin },
    });

    const result = await quote.execute("owner-1", "casa");

    expect(router.received).toEqual([
      { origin: newOrigin, destination: { latitude: -9.66, longitude: -35.74 } },
    ]);
    expect(result).toEqual({ naArea: true, freteCentavos: 1_700, gratis: false });
    expect((await addresses.list("owner-1"))[0]).toMatchObject({
      distanceMeters: 8_000,
      routeOrigin: newOrigin,
    });
  });
});
