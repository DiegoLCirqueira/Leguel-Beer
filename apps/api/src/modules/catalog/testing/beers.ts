import type { Beer } from "../domain/beer.js";

export const CATEGORIES = {
  ipa: { slug: "ipa", name: "IPAs", order: 1 },
  frutas: { slug: "frutas", name: "Frutas", order: 2 },
  malt: { slug: "malt", name: "Malt", order: 3 },
  lager: { slug: "lager", name: "Lager", order: 4 },
} as const;

let sequence = 0;

/** Cerveja de teste com valores neutros; cada chamada gera slug e id próprios. */
export function makeBeer(overrides: Partial<Beer> = {}): Beer {
  sequence += 1;
  return {
    id: `beer-${sequence}`,
    slug: `cerveja-${sequence}`,
    name: `Cerveja ${sequence}`,
    style: "American IPA",
    category: CATEGORIES.ipa,
    abv: 5,
    ibu: 30,
    volumeMl: 500,
    priceCents: 2800,
    featured: false,
    stock: 10,
    reserved: 0,
    description: null,
    previousPriceCents: null,
    imageUrl: null,
    createdAt: new Date("2026-10-01T12:00:00Z"),
    ...overrides,
  };
}
