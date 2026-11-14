import type { Address, AddressInput } from "../domain/address.js";
import type { AddressRepository } from "../domain/address-repository.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";
import type { Geocoder, RouteCalculator } from "../domain/maps.js";

export class AddAddress {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly geocoder: Geocoder,
    private readonly router: RouteCalculator,
    private readonly settings: DeliverySettingsRepository,
    private readonly newId: () => string,
    private readonly now: () => Date,
  ) {}

  async execute(ownerId: string, input: AddressInput): Promise<Address> {
    const { origem } = await this.settings.get();
    // Os mapas ficam fora da trava da conta: nenhuma chamada externa dentro da gravação.
    const coordinates = await this.geocoder.geocode({
      street: input.street,
      number: input.number,
      district: input.district,
      city: input.city,
      state: input.state,
      zip: input.zip,
    });
    const distanceMeters = await this.router.routeDistanceMeters(origem, coordinates!);

    return this.addresses.update(ownerId, (current) => {
      const address: Address = {
        ...input,
        id: this.newId(),
        ownerId,
        isDefault: current.length === 0,
        coordinates: coordinates!,
        distanceMeters,
        routeOrigin: origem,
        createdAt: this.now(),
      };
      return { addresses: [...current, address], result: address };
    });
  }
}
