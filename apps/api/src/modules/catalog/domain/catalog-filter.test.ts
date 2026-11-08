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

  it("filtra por faixa de teor: o limite inferior entra e o superior nÃ£o", () => {
    const abaixo = makeBeer({ name: "4,4", abv: 4.4 });
    const noLimiteInferior = makeBeer({ name: "4,5", abv: 4.5 });
    const dentro = makeBeer({ name: "5,9", abv: 5.9 });
    const noLimiteSuperior = makeBeer({ name: "6", abv: 6 });

    const resultado = filterBeers([abaixo, noLimiteInferior, dentro, noLimiteSuperior], {
      abv: { min: 4.5, max: 6 },
    });

    expect(names(resultado)).toEqual(["4,5", "5,9"]);
  });

  it("filtra por faixa de IBU: o limite inferior entra e o superior nÃ£o", () => {
    const abaixo = makeBeer({ name: "19", ibu: 19 });
    const noLimiteInferior = makeBeer({ name: "20", ibu: 20 });
    const noLimiteSuperior = makeBeer({ name: "40", ibu: 40 });

    const resultado = filterBeers([abaixo, noLimiteInferior, noLimiteSuperior], {
      ibu: { min: 20, max: 40 },
    });

    expect(names(resultado)).toEqual(["20"]);
  });
});
