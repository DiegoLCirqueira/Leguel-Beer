import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export class InMemoryBeerRepository implements BeerRepository {
  constructor(private readonly beers: Beer[] = []) {}

  findActiveBySlug(slug: string): Promise<Beer | null> {
    return Promise.resolve(this.beers.find((beer) => beer.slug === slug) ?? null);
  }

  findActive(): Promise<Beer[]> {
    return Promise.resolve([...this.beers]);
  }
}
