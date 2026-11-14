import type { Address } from "../domain/address.js";
import type { AddressRepository } from "../domain/address-repository.js";
import { isOutsideDeliveryArea } from "../domain/delivery-area.js";
import type { DeliverySettingsRepository } from "../domain/delivery-settings-repository.js";

export interface AddressListItem extends Address {
  outsideArea: boolean;
}

export class ListAddresses {
  constructor(
    private readonly addresses: AddressRepository,
    private readonly settings: DeliverySettingsRepository,
  ) {}

  async execute(ownerId: string): Promise<AddressListItem[]> {
    const { raioMaximoMetros } = await this.settings.get();
    const stored = await this.addresses.list(ownerId);
    return stored.map((address) => ({
      ...address,
      outsideArea: isOutsideDeliveryArea(address.distanceMeters, raioMaximoMetros),
    }));
  }
}
