import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { MapsUnavailableError } from "../domain/maps.js";
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

  it("origem igual à guardada: não chama a rota e não grava nada", async () => {
    const { addresses, router, quote } = await setup({
      distanceMeters: 5_200,
      subtotalCents: 9_050,
    });
    const before = await addresses.list("owner-1");

    await quote.execute("owner-1", "casa");

    expect(router.received).toEqual([]);
    expect(await addresses.list("owner-1")).toEqual(before);
  });

  it.each(["unavailable", -1, 12.5] as const)(
    "origem mudada com a rota devolvendo %s: erro de mapas e o endereço guardado não muda",
    async (outcome) => {
      const newOrigin = { latitude: -9.7, longitude: -35.8 };
      const { addresses, router, quote } = await setup({
        distanceMeters: 5_200,
        subtotalCents: 9_050,
        settings: { ...SETTINGS, origem: newOrigin },
      });
      router.respondWith(outcome);
      const before = await addresses.list("owner-1");

      await expect(quote.execute("owner-1", "casa")).rejects.toBeInstanceOf(MapsUnavailableError);

      expect(await addresses.list("owner-1")).toEqual(before);
    },
  );

  it("origem mudada e agora sem rota: fora da área, e a falta de rota é guardada com a origem nova", async () => {
    const newOrigin = { latitude: -9.7, longitude: -35.8 };
    const { addresses, router, quote } = await setup({
      distanceMeters: 5_200,
      subtotalCents: 9_050,
      settings: { ...SETTINGS, origem: newOrigin },
    });
    router.respondWith(null);

    expect(await quote.execute("owner-1", "casa")).toEqual({ naArea: false });
    expect((await addresses.list("owner-1"))[0]).toMatchObject({
      distanceMeters: null,
      routeOrigin: newOrigin,
    });
  });

  it("origem mudada e o endereço sem rota antes passa a ter rota: cota com a distância nova", async () => {
    const newOrigin = { latitude: -9.7, longitude: -35.8 };
    const { quote } = await setup({
      distanceMeters: null,
      subtotalCents: 9_050,
      settings: { ...SETTINGS, origem: newOrigin },
    });

    expect(await quote.execute("owner-1", "casa")).toEqual({
      naArea: true,
      freteCentavos: 1_700,
      gratis: false,
    });
  });

  it("endereço de outro cliente ou inexistente: não encontrado, sem chamar rota nem ler a Geladeira", async () => {
    const { addresses, router } = await setup({ distanceMeters: 5_200, subtotalCents: 9_050 });
    await addresses.update("owner-2", () => ({
      addresses: [anAddress({ id: "do-outro", ownerId: "owner-2" })],
      result: undefined,
    }));
    let fridgeReads = 0;
    const quote = new QuoteShipping(
      addresses,
      { get: async () => ({ ...SETTINGS, origem: { latitude: -9.7, longitude: -35.8 } }) },
      router,
      {
        subtotalCents: async () => {
          fridgeReads++;
          return 0;
        },
      },
    );

    await expect(quote.execute("owner-1", "do-outro")).rejects.toBeInstanceOf(NotFoundError);
    await expect(quote.execute("owner-1", "nao-existe")).rejects.toBeInstanceOf(NotFoundError);

    expect(router.received).toEqual([]);
    expect(fridgeReads).toBe(0);
  });
});
