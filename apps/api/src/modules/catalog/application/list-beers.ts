import { faixasDeFiltro, type CatalogoQuery, type Faixa } from "@leguele/shared";
import type { Beer } from "../domain/beer.js";
import { filterBeers } from "../domain/catalog-filter.js";
import { sortBeers } from "../domain/catalog-order.js";
import type { BeerRepository } from "../domain/beer-repository.js";
import type { Range } from "../domain/catalog-filter.js";

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

/** O id da faixa vem da URL; id que não existe não filtra nada. */
function rangeOf(faixas: readonly Faixa[], id: string | undefined): Range | undefined {
  const faixa = faixas.find((candidate) => candidate.id === id);
  return faixa && { min: faixa.minimo, max: faixa.maximo };
}

export class ListBeers {
  constructor(private readonly beers: BeerRepository) {}

  async execute(query: CatalogoQuery): Promise<CatalogResult> {
    const active = await this.beers.findActive();
    const categories = countByCategory(active);
    const known = categories.some((category) => category.slug === query.categoria);
    const filtered = filterBeers(active, {
      categorySlug: known ? query.categoria : undefined,
      abv: rangeOf(faixasDeFiltro.teor, query.teor),
      ibu: rangeOf(faixasDeFiltro.ibu, query.ibu),
      priceCents: rangeOf(faixasDeFiltro.preco, query.preco),
      onlyAvailable: query.disponiveis,
    });
    const items = sortBeers(filtered, query.ordem);
    return { items, total: items.length, categories };
  }
}
