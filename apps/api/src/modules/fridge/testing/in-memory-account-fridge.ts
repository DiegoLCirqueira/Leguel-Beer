import type {
  AccountFridgeRepository,
  StoredFridgeItem,
} from "../domain/account-fridge-repository.js";

export class InMemoryAccountFridgeRepository implements AccountFridgeRepository {
  private readonly fridges = new Map<string, StoredFridgeItem[]>();
  replaceCalls = 0;

  find(profileId: string): Promise<StoredFridgeItem[]> {
    return Promise.resolve([...(this.fridges.get(profileId) ?? [])]);
  }

  replace(profileId: string, items: readonly StoredFridgeItem[]): Promise<void> {
    this.replaceCalls += 1;
    this.fridges.set(profileId, [...items]);
    return Promise.resolve();
  }
}
