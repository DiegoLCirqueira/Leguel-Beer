import type { Beer } from "./beer.js";

export type CatalogOrder = "relevancia" | "menor-preco" | "maior-preco" | "mais-novas";

export function sortBeers(beers: readonly Beer[], order: CatalogOrder): Beer[] {
  void order;
  return [...beers];
}
