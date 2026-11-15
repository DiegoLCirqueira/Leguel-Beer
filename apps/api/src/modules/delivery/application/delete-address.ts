import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { AddressRepository } from "../domain/address-repository.js";

export class DeleteAddress {
  constructor(private readonly addresses: AddressRepository) {}

  async execute(ownerId: string, addressId: string): Promise<void> {
    await this.addresses.update(ownerId, (current) => {
      const target = current.find((address) => address.id === addressId);
      if (!target) throw new NotFoundError();

      const remaining = current.filter((address) => address.id !== addressId);
      if (!target.isDefault || remaining.length === 0)
        return { addresses: remaining, result: undefined };

      // Excluir o padrão torna padrão o endereço salvo mais recentemente.
      const newest = remaining.reduce((latest, address) =>
        address.createdAt.getTime() >= latest.createdAt.getTime() ? address : latest,
      );
      return {
        addresses: remaining.map((address) => ({
          ...address,
          isDefault: address.id === newest.id,
        })),
        result: undefined,
      };
    });
  }
}
