import { NotFoundError } from "../../../common/errors/not-found-error.js";
import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export class GetBeer {
  constructor(private readonly beers: BeerRepository) {}

  async execute(slug: string): Promise<Beer> {
    const beer = await this.beers.findActiveBySlug(slug);
    if (!beer) throw new NotFoundError();
    return beer;
  }
}
