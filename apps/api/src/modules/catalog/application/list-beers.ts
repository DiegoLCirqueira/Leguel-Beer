import type { CatalogoQuery } from "@leguele/shared";
import type { Beer } from "../domain/beer.js";
import { filterBeers } from "../domain/catalog-filter.js";
import { sortBeers } from "../domain/catalog-order.js";
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

/** Conta as cervejas ativas de cada categoria (esgotadas incluídas), na ordem das categorias; sem cerveja, sem linha. */
function countByCategory(beers: readonly Beer[]): CategoryCount[] {
  const counts = new Map<string, CategoryCount>();
  for (const { category } of beers) {
    const found = counts.get(category.slug);
    if (found) found.quantity += 1;
    else counts.set(category.slug, { ...category, quantity: 1 });
  }
  return [...counts.values()].sort((a, b) => a.order - b.order);
}

export class ListBeers {
  constructor(private readonly beers: BeerRepository) {}

  async execute(query: CatalogoQuery): Promise<CatalogResult> {
    const active = await this.beers.findActive();
    const filtered = filterBeers(active, { categorySlug: query.categoria });
    const items = sortBeers(filtered, "relevancia");
    return { items, total: items.length, categories: countByCategory(active) };
  }
}
