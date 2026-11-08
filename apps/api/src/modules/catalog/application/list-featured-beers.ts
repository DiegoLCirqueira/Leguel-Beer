import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";
import { sortBeers } from "../domain/catalog-order.js";

/** A home mostra no máximo 6 destaques (spec destaques-home). */
const MAX_FEATURED = 6;

export class ListFeaturedBeers {
  constructor(private readonly beers: BeerRepository) {}

  async execute(): Promise<Beer[]> {
    const featured = (await this.beers.findActive()).filter((beer) => beer.featured);
    return sortBeers(featured, "relevancia").slice(0, MAX_FEATURED);
  }
}
