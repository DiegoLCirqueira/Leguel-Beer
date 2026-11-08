import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export class InMemoryBeerRepository implements BeerRepository {
  constructor(private readonly beers: Beer[] = []) {}

  findActive(): Promise<Beer[]> {
    return Promise.resolve([...this.beers]);
  }
}
