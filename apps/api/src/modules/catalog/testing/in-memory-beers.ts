import type { Beer } from "../domain/beer.js";
import type { BeerRepository, BeerWithStatus } from "../domain/beer-repository.js";

export class InMemoryBeerRepository implements BeerRepository {
  constructor(private readonly beers: Beer[] = []) {}

  findActiveBySlug(slug: string): Promise<Beer | null> {
    return Promise.resolve(this.beers.find((beer) => beer.slug === slug) ?? null);
  }

  findActive(): Promise<Beer[]> {
    return Promise.resolve([...this.beers]);
  }

  /** O fake só guarda cervejas ativas (como a vitrine); todas voltam com `active: true`. */
  findByIds(ids: readonly string[]): Promise<BeerWithStatus[]> {
    return Promise.resolve(
      this.beers.filter((beer) => ids.includes(beer.id)).map((beer) => ({ beer, active: true })),
    );
  }
}
