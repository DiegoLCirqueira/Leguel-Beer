import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { AddressInput } from "../domain/address.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import { AddressNotLocatedError } from "../domain/address-errors.js";
import { MapsUnavailableError } from "../domain/maps.js";
import { anAddress, ORIGIN } from "../testing/factories.js";
import { FakeGeocoder, FakeRouteCalculator } from "../testing/fake-maps.js";
import { InMemoryAddressRepository } from "../testing/in-memory-addresses.js";
import { UpdateAddress } from "./update-address.js";

const settings: DeliverySettingsRepository = {
  get: async () => ({
    taxaBaseCentavos: 500,
    valorPorKmCentavos: 150,
    raioMaximoMetros: 25_000,
    freteGratisMinimoCentavos: 15_000,
    origem: ORIGIN,
  }),
};

const stored = anAddress({
  id: "casa",
  isDefault: true,
  createdAt: new Date("2026-11-01T09:00:00.000Z"),
});

const sameFields: AddressInput = {
  zip: stored.zip,
  street: stored.street,
  number: stored.number,
  district: stored.district,
  city: stored.city,
  state: "AL",
};

async function setup() {
  const addresses = new InMemoryAddressRepository();
  await addresses.update("owner-1", () => ({ addresses: [stored], result: undefined }));
  const geocoder = new FakeGeocoder({ latitude: -9.7, longitude: -35.8 });
  const router = new FakeRouteCalculator(8_000);
  return {
    addresses,
    geocoder,
    router,
    update: new UpdateAddress(addresses, geocoder, router, settings),
  };
}

describe("UpdateAddress", () => {
  it("ao mudar a rua recalcula coordenadas e distância e mantém id, padrão e data de criação", async () => {
    const { addresses, update } = await setup();

    await update.execute("owner-1", "casa", { ...sameFields, street: "Rua da Praia" });

    expect(await addresses.list("owner-1")).toEqual([
      {
        ...stored,
        street: "Rua da Praia",
        coordinates: { latitude: -9.7, longitude: -35.8 },
        distanceMeters: 8_000,
        routeOrigin: ORIGIN,
      },
    ]);
  });

  it("mudar só o apelido ou o complemento não chama os mapas e mantém as coordenadas e a distância", async () => {
    const { addresses, geocoder, router, update } = await setup();

    await update.execute("owner-1", "casa", {
      ...sameFields,
      nickname: "Casa da praia",
      complement: "Apto 12",
    });

    expect(geocoder.received).toEqual([]);
    expect(router.received).toEqual([]);
    expect(await addresses.list("owner-1")).toEqual([
      { ...stored, nickname: "Casa da praia", complement: "Apto 12" },
    ]);
  });

  it("apagar o apelido e o complemento no formulário os remove do endereço", async () => {
    const { addresses, update } = await setup();
    await addresses.update("owner-1", () => ({
      addresses: [{ ...stored, nickname: "Casa", complement: "Apto 12" }],
      result: undefined,
    }));

    await update.execute("owner-1", "casa", sameFields);

    const [saved] = await addresses.list("owner-1");
    expect(saved?.nickname).toBeUndefined();
    expect(saved?.complement).toBeUndefined();
  });

  it.each([
    ["mapas fora do ar na geocodificação", "geocoder", "unavailable", MapsUnavailableError],
    ["mapas fora do ar na rota", "router", "unavailable", MapsUnavailableError],
    ["endereço que o serviço não acha", "geocoder", null, AddressNotLocatedError],
  ] as const)(
    "com %s, o endereço anterior continua salvo como estava",
    async (_name, which, outcome, errorClass) => {
      const { addresses, geocoder, router, update } = await setup();
      (which === "geocoder" ? geocoder : router).respondWith(outcome as never);

      await expect(
        update.execute("owner-1", "casa", { ...sameFields, street: "Rua da Praia" }),
      ).rejects.toBeInstanceOf(errorClass);

      expect(await addresses.list("owner-1")).toEqual([stored]);
    },
  );

  it("responde não encontrado, sem chamar os mapas, para o endereço de outro cliente ou inexistente", async () => {
    const { addresses, geocoder, update } = await setup();
    await addresses.update("owner-2", () => ({
      addresses: [anAddress({ id: "do-outro", ownerId: "owner-2" })],
      result: undefined,
    }));

    await expect(update.execute("owner-1", "do-outro", sameFields)).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(update.execute("owner-1", "nao-existe", sameFields)).rejects.toBeInstanceOf(
      NotFoundError,
    );

    expect(geocoder.received).toEqual([]);
    expect((await addresses.list("owner-2"))[0]?.street).toBe("Rua do Sol");
  });
});
