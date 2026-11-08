import type { Beer } from "./beer.js";

export type CatalogOrder = "relevancia" | "menor-preco" | "maior-preco" | "mais-novas";

const byName = (a: Beer, b: Beer) => a.name.localeCompare(b.name, "pt-BR");

function byRelevance(a: Beer, b: Beer): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return a.category.order - b.category.order || byName(a, b);
}

export function sortBeers(beers: readonly Beer[], order: CatalogOrder): Beer[] {
  void order;
  return [...beers].sort(byRelevance);
}
