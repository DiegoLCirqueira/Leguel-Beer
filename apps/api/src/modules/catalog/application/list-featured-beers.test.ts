import { describe, expect, it } from "vitest";
import { CATEGORIES, makeBeer } from "../testing/beers.js";
import { InMemoryBeerRepository } from "../testing/in-memory-beers.js";
import { ListFeaturedBeers } from "./list-featured-beers.js";

const names = (beers: readonly { name: string }[]) => beers.map((beer) => beer.name);

describe("ListFeaturedBeers", () => {
  it("lista só os destaques, pela ordem das categorias e depois pelo nome, com a esgotada por último", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "Lager Praia", category: CATEGORIES.lager, featured: true }),
      makeBeer({ name: "IPA Zabumba", category: CATEGORIES.ipa, featured: true }),
      makeBeer({ name: "IPA Comum", category: CATEGORIES.ipa }),
      makeBeer({ name: "IPA Esgotada", category: CATEGORIES.ipa, featured: true, stock: 0 }),
      makeBeer({ name: "IPA Aratu", category: CATEGORIES.ipa, featured: true }),
      makeBeer({ name: "Frutas Caju", category: CATEGORIES.frutas, featured: true }),
    ]);

    const result = await new ListFeaturedBeers(repository).execute();

    expect(names(result)).toEqual([
      "IPA Aratu",
      "IPA Zabumba",
      "Frutas Caju",
      "Lager Praia",
      "IPA Esgotada",
    ]);
  });
});
