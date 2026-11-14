import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { AddressRepository } from "../domain/address-repository.js";

export class SetDefaultAddress {
  constructor(private readonly addresses: AddressRepository) {}

  async execute(ownerId: string, addressId: string): Promise<void> {
    await this.addresses.update(ownerId, (current) => {
      // Posse: só os endereços do próprio cliente entram em `current`; os de outros respondem como inexistentes.
      if (!current.some((address) => address.id === addressId)) throw new NotFoundError();
      return {
        addresses: current.map((address) => ({ ...address, isDefault: address.id === addressId })),
        result: undefined,
      };
    });
  }
}
