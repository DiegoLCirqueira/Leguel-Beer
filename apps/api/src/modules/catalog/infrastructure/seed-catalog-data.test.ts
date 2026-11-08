import { faixasDeFiltro, pertenceAFaixa } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { SEED_CATEGORIES } from "./seed-catalog-data.js";

const beers = SEED_CATEGORIES.flatMap((category) => category.beers);

describe("dados do seed do catálogo", () => {
  it("são 16 cervejas, 4 em cada categoria, com slugs e datas de cadastro únicos", () => {
    expect(beers).toHaveLength(16);
    expect(SEED_CATEGORIES.map((category) => category.beers.length)).toEqual([4, 4, 4, 4]);
    expect(new Set(beers.map((beer) => beer.slug)).size).toBe(16);
    expect(new Set(beers.map((beer) => beer.createdAt.getTime())).size).toBe(16);
  });

  it("cada faixa de teor, IBU e preço tem pelo menos uma cerveja", () => {
    const valores = {
      teor: beers.map((beer) => beer.abv),
      ibu: beers.map((beer) => beer.ibu),
      preco: beers.map((beer) => beer.priceCents),
    };

    for (const atributo of ["teor", "ibu", "preco"] as const) {
      for (const faixa of faixasDeFiltro[atributo]) {
        const dentro = valores[atributo].filter((valor) => pertenceAFaixa(faixa, valor));
        expect(dentro.length, `${atributo}: ${faixa.id}`).toBeGreaterThan(0);
      }
    }
  });

  it("tem mais de 6 destaques (para exercitar o corte da home) e uma cerveja esgotada", () => {
    expect(beers.filter((beer) => beer.featured).length).toBeGreaterThan(6);
    expect(beers.filter((beer) => beer.stock === 0)).toHaveLength(1);
  });
});
