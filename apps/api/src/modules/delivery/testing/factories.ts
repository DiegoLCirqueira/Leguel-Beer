import type { Address } from "../domain/address.js";

export const ORIGIN = { latitude: -9.6649, longitude: -35.7313 };

/** Endereço de teste com valores válidos; sobrescreva só o que importa para o caso. */
export function anAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: "address-1",
    ownerId: "owner-1",
    zip: "57035000",
    street: "Rua do Sol",
    number: "100",
    district: "Farol",
    city: "Maceió",
    state: "AL",
    isDefault: false,
    coordinates: { latitude: -9.66, longitude: -35.74 },
    distanceMeters: 5_200,
    routeOrigin: ORIGIN,
    createdAt: new Date("2026-11-14T12:00:00.000Z"),
    ...overrides,
  };
}
