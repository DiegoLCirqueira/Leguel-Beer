import type { CatalogoQuery } from "@leguele/shared";
import type { Beer } from "../domain/beer.js";
import type { BeerRepository } from "../domain/beer-repository.js";

export interface CategoryCount {
  slug: string;
  name: string;
  order: number;
  quantity: number;
}

export interface CatalogResult {
  items: Beer[];
  total: number;
  categories: CategoryCount[];
}

export class ListBeers {
  constructor(private readonly beers: BeerRepository) {}

  async execute(query: CatalogoQuery): Promise<CatalogResult> {
    void query;
    await this.beers.findActive();
    return { items: [], total: 0, categories: [] };
  }
}
