import { describe, expect, it } from "vitest";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import { AddressLimitReachedError, AddressNotLocatedError } from "../domain/address-errors.js";
import { InMemoryAddressRepository } from "../testing/in-memory-addresses.js";
import { FakeGeocoder, FakeRouteCalculator } from "../testing/fake-maps.js";
import { AddAddress } from "./add-address.js";

const NOW = new Date("2026-11-14T12:00:00.000Z");
const ORIGIN = { latitude: -9.6649, longitude: -35.7313 };

const settings: DeliverySettingsRepository = {
  get: async () => ({
    taxaBaseCentavos: 500,
    valorPorKmCentavos: 150,
    raioMaximoMetros: 25_000,
    freteGratisMinimoCentavos: 15_000,
    origem: ORIGIN,
  }),
};

const input = {
  zip: "57035000",
  street: "Rua do Sol",
  number: "100",
  district: "Farol",
  city: "Maceió",
  state: "AL",
} as const;

function setup() {
  const addresses = new InMemoryAddressRepository();
  const geocoder = new FakeGeocoder({ latitude: -9.66, longitude: -35.74 });
  const router = new FakeRouteCalculator(5_200);
  let sequence = 0;
  const add = new AddAddress(
    addresses,
    geocoder,
    router,
    settings,
    () => `address-${++sequence}`,
    () => NOW,
  );
  return { addresses, geocoder, router, add };
}

describe("AddAddress", () => {
  it("salva o primeiro endereço como padrão, com as coordenadas, a distância de rota e a origem usada", async () => {
    const { addresses, add } = setup();

    await add.execute("owner-1", input);

    expect(await addresses.list("owner-1")).toEqual([
      {
        ...input,
        id: "address-1",
        ownerId: "owner-1",
        isDefault: true,
        coordinates: { latitude: -9.66, longitude: -35.74 },
        distanceMeters: 5_200,
        routeOrigin: ORIGIN,
        createdAt: NOW,
      },
    ]);
  });

  it("o segundo endereço não vira padrão e o primeiro continua padrão", async () => {
    const { addresses, add } = setup();
    await add.execute("owner-1", input);

    await add.execute("owner-1", { ...input, nickname: "Trabalho", street: "Rua da Praia" });

    const saved = await addresses.list("owner-1");
    expect(saved.map(({ id, isDefault }) => ({ id, isDefault }))).toEqual([
      { id: "address-1", isDefault: true },
      { id: "address-2", isDefault: false },
    ]);
  });

  it("recusa o sexto endereço antes de chamar os mapas e sem gravar nada", async () => {
    const { addresses, geocoder, router, add } = setup();
    for (let i = 0; i < 5; i++) await add.execute("owner-1", input);
    const callsBefore = geocoder.received.length;

    await expect(add.execute("owner-1", input)).rejects.toBeInstanceOf(AddressLimitReachedError);

    expect(await addresses.list("owner-1")).toHaveLength(5);
    expect(geocoder.received).toHaveLength(callsBefore);
    expect(router.received).toHaveLength(callsBefore);
  });

  it("não salva nem calcula a rota quando o serviço de mapas não acha o endereço", async () => {
    const { addresses, geocoder, router, add } = setup();
    geocoder.respondWith(null);

    await expect(add.execute("owner-1", input)).rejects.toBeInstanceOf(AddressNotLocatedError);

    expect(await addresses.list("owner-1")).toEqual([]);
    expect(router.received).toEqual([]);
  });
});
