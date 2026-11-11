import type { Beer } from "../../catalog/domain/beer.js";
import type { FridgeBeer, FridgeBeerLookup } from "../domain/fridge-beer-lookup.js";

export class InMemoryFridgeBeerLookup implements FridgeBeerLookup {
  private readonly entries: FridgeBeer[] = [];

  add(beer: Beer, { active = true }: { active?: boolean } = {}): this {
    this.entries.push({ beer, active });
    return this;
  }

  findByIds(ids: readonly string[]): Promise<FridgeBeer[]> {
    return Promise.resolve(this.entries.filter(({ beer }) => ids.includes(beer.id)));
  }
}
