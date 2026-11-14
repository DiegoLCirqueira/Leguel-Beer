import type { AddressRepository } from "../domain/address-repository.js";

export class SetDefaultAddress {
  constructor(private readonly addresses: AddressRepository) {}

  async execute(ownerId: string, addressId: string): Promise<void> {
    await this.addresses.update(ownerId, (current) => ({
      addresses: current.map((address) => ({ ...address, isDefault: address.id === addressId })),
      result: undefined,
    }));
  }
}
