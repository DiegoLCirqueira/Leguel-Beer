import type { BeerRepository } from "../../catalog/domain/beer-repository.js";
import type { FridgeBeer, FridgeBeerLookup } from "../domain/fridge-beer-lookup.js";

/** A Geladeira lê as cervejas pela porta que o módulo do catálogo expõe, sem tocar no banco dele. */
export class CatalogFridgeBeerLookup implements FridgeBeerLookup {
  constructor(private readonly beers: BeerRepository) {}

  findByIds(ids: readonly string[]): Promise<FridgeBeer[]> {
    return this.beers.findByIds(ids);
  }
}
