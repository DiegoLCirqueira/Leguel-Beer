import type {
  AccountFridgeRepository,
  FridgeUpdate,
  StoredFridgeItem,
} from "../domain/account-fridge-repository.js";

export class InMemoryAccountFridgeRepository implements AccountFridgeRepository {
  private readonly fridges = new Map<string, StoredFridgeItem[]>();
  replaceCalls = 0;
  updateCalls = 0;

  find(profileId: string): Promise<StoredFridgeItem[]> {
    return Promise.resolve([...(this.fridges.get(profileId) ?? [])]);
  }

  replace(profileId: string, items: readonly StoredFridgeItem[]): Promise<void> {
    this.replaceCalls += 1;
    this.fridges.set(profileId, [...items]);
    return Promise.resolve();
  }

  async update<T>(
    profileId: string,
    decide: (current: StoredFridgeItem[]) => FridgeUpdate<T> | Promise<FridgeUpdate<T>>,
  ): Promise<T> {
    this.updateCalls += 1;
    const outcome = await decide(await this.find(profileId));
    if (outcome.items) this.fridges.set(profileId, [...outcome.items]);
    return outcome.result;
  }
}
