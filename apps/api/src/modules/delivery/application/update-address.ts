import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Address, AddressInput } from "../domain/address.js";
import { AddressNotLocatedError } from "../domain/address-errors.js";
import type { AddressRepository } from "../domain/address-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import type { Geocoder, RouteCalculator } from "../domain/maps.js";

export class UpdateAddress {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly geocoder: Geocoder,
    private readonly router: RouteCalculator,
    private readonly settings: DeliverySettingsRepository,
  ) {}

  async execute(ownerId: string, addressId: string, input: AddressInput): Promise<Address> {
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

    return this.addresses.update(ownerId, (current) => {
      const target = current.find((address) => address.id === addressId);
      if (!target) throw new NotFoundError();
      const updated: Address = {
        ...target,
        ...input,
        coordinates,
        distanceMeters,
        routeOrigin: origem,
      };
      return {
        addresses: current.map((address) => (address.id === addressId ? updated : address)),
        result: updated,
      };
    });
  }
}
