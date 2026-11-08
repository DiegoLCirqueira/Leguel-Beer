import { describe, expect, it } from "vitest";
import { CATEGORIES, makeBeer } from "../testing/beers.js";
import { filterBeers } from "./catalog-filter.js";

const names = (beers: readonly { name: string }[]) => beers.map((beer) => beer.name);

describe("filterBeers", () => {
  it("sem filtros devolve todas, na mesma ordem", () => {
    const todas = [makeBeer({ name: "A" }), makeBeer({ name: "B" })];

    expect(names(filterBeers(todas, {}))).toEqual(["A", "B"]);
  });

  it("filtra por uma categoria", () => {
    const ipa = makeBeer({ name: "IPA", category: CATEGORIES.ipa });
    const lager = makeBeer({ name: "Lager", category: CATEGORIES.lager });

    expect(names(filterBeers([ipa, lager], { categorySlug: "ipa" }))).toEqual(["IPA"]);
  });
});
