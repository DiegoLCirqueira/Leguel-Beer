import type { Beer } from "./beer.js";

export type CatalogOrder = "relevancia" | "menor-preco" | "maior-preco" | "mais-novas";

const byName = (a: Beer, b: Beer) => a.name.localeCompare(b.name, "pt-BR");

function byRelevance(a: Beer, b: Beer): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return a.category.order - b.category.order || byName(a, b);
}

const byCheapest = (a: Beer, b: Beer) => a.priceCents - b.priceCents;

const byNewest = (a: Beer, b: Beer) => b.createdAt.getTime() - a.createdAt.getTime();

export function sortBeers(beers: readonly Beer[], order: CatalogOrder): Beer[] {
  const primary = order === "mais-novas" ? byNewest : byCheapest;
  return [...beers].sort((a, b) => primary(a, b) || byRelevance(a, b));
}
