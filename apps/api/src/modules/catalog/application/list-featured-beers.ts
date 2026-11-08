import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export class ListFeaturedBeers {
  constructor(private readonly beers: BeerRepository) {}

  async execute(): Promise<Beer[]> {
    await this.beers.findActive();
    return [];
  }
}
