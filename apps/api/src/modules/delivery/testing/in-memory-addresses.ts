import type { Address } from "../domain/address.js";
import type { AddressRepository, AddressUpdate } from "../domain/address-repository.js";

export class InMemoryAddressRepository implements AddressRepository {
  private readonly byOwner = new Map<string, Address[]>();

  async list(ownerId: string): Promise<Address[]> {
    return [...(this.byOwner.get(ownerId) ?? [])];
  }

  async update<T>(
    ownerId: string,
    decide: (current: Address[]) => AddressUpdate<T> | Promise<AddressUpdate<T>>,
  ): Promise<T> {
    const outcome = await decide(await this.list(ownerId));
    if (outcome.addresses) this.byOwner.set(ownerId, [...outcome.addresses]);
    return outcome.result;
  }
}
