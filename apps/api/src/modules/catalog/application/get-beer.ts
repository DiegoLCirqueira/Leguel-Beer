import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export class GetBeer {
  constructor(private readonly beers: BeerRepository) {}

  async execute(slug: string): Promise<Beer> {
    return (await this.beers.findActiveBySlug(slug)) as Beer;
  }
}
