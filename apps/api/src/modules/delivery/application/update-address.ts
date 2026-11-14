import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Address, AddressInput, Coordinates } from "../domain/address.js";
import { AddressNotLocatedError } from "../domain/address-errors.js";
import type { AddressRepository } from "../domain/address-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import type { Geocoder, RouteCalculator } from "../domain/maps.js";

/** Mudar qualquer um destes muda o lugar: recalcula coordenadas e distância. Apelido e complemento não. */
function locationChanged(address: Address, input: AddressInput): boolean {
  return (
    address.zip !== input.zip ||
    address.street !== input.street ||
    address.number !== input.number ||
    address.district !== input.district ||
    address.city !== input.city ||
    address.state !== input.state
  );
}

interface Recalculated {
  coordinates: Coordinates;
  distanceMeters: number | null;
  routeOrigin: Coordinates;
}

export class UpdateAddress {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly geocoder: Geocoder,
    private readonly router: RouteCalculator,
    private readonly settings: DeliverySettingsRepository,
  ) {}

  async execute(ownerId: string, addressId: string, input: AddressInput): Promise<Address> {
    const existing = (await this.addresses.list(ownerId)).find(({ id }) => id === addressId);
    if (!existing) throw new NotFoundError();

    // Os mapas ficam fora da trava da conta: nenhuma chamada externa dentro da gravação.
    const recalculated = locationChanged(existing, input) ? await this.recalculate(input) : null;

    return this.addresses.update(ownerId, (current) => {
      const target = current.find((address) => address.id === addressId);
      if (!target) throw new NotFoundError();
      const updated: Address = { ...target, ...input, ...recalculated };
      return {
        addresses: current.map((address) => (address.id === addressId ? updated : address)),
        result: updated,
      };
    });
  }

  private async recalculate(input: AddressInput): Promise<Recalculated> {
    const { origem } = await this.settings.get();
    const coordinates = await this.geocoder.geocode({
      street: input.street,
      number: input.number,
      district: input.district,
      city: input.city,
      state: input.state,
      zip: input.zip,
    });
    if (!coordinates) throw new AddressNotLocatedError();
    const distanceMeters = await this.router.routeDistanceMeters(origem, coordinates);
    return { coordinates, distanceMeters, routeOrigin: origem };
  }
}
