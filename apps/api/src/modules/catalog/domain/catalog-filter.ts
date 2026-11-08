import type { Beer } from "./beer.js";

/** Intervalo com o limite inferior incluído e o superior excluído. */
export interface Range {
  min: number;
  max: number;
}

export interface CatalogFilters {
  categorySlug?: string;
  abv?: Range;
  ibu?: Range;
  priceCents?: Range;
  onlyAvailable?: boolean;
}

export function filterBeers(beers: readonly Beer[], filters: CatalogFilters): Beer[] {
  void filters;
  return [...beers];
}
