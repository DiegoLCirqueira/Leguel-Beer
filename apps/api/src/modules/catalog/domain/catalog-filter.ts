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

const within = (value: number, range: Range | undefined) =>
  !range || (value >= range.min && value < range.max);

export function filterBeers(beers: readonly Beer[], filters: CatalogFilters): Beer[] {
  return beers.filter(
    (beer) =>
      (!filters.categorySlug || beer.category.slug === filters.categorySlug) &&
      within(beer.abv, filters.abv),
  );
}
