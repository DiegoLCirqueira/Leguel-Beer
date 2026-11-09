import { calcularDesconto, faixasDeFiltro, pertenceAFaixa } from "@leguele/shared";
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

  it("tem 8 destaques (para exercitar o corte da home) e a Leguelé Comendador como única esgotada", () => {
    expect(
      beers
        .filter((beer) => beer.featured)
        .map((beer) => beer.slug)
        .sort(),
    ).toEqual([
      "avermelhou",
      "barra-nova-porter",
      "cajupa-sour",
      "cupuacu-ale",
      "jaragua-hazy-ipa",
      "leguele-carnaval",
      "leguele-kolsch",
      "mare-alta",
    ]);
    expect(beers.filter((beer) => beer.stock === 0).map((beer) => beer.slug)).toEqual([
      "leguele-comendador",
    ]);
  });

  it("segue a tabela da spec: 4 cervejas por categoria, com estilo, teor, IBU, volume e preço", () => {
    expect(SEED_CATEGORIES.map((c) => [c.slug, c.beers.map((b) => b.slug)])).toEqual([
      ["ipa", ["mare-alta", "leguele-carnaval", "leguele-maceio-ipa", "jaragua-hazy-ipa"]],
      ["frutas", ["cupuacu-ale", "cajupa-sour", "umbu-gose", "graviola-witbier"]],
      ["malt", ["avermelhou", "rapadura-brown-ale", "barra-nova-porter", "pajucara-amber-ale"]],
      [
        "lager",
        ["leguele-kolsch", "leguele-cream-ale", "leguele-comendador", "ponta-verde-pilsen"],
      ],
    ]);
    expect(beers.map((b) => [b.slug, b.style, b.abv, b.ibu, b.volumeMl, b.priceCents])).toEqual([
      ["mare-alta", "American IPA", 6.5, 65, 330, 3200],
      ["leguele-carnaval", "Session IPA", 4.2, 30, 330, 3000],
      ["leguele-maceio-ipa", "IPA", 6.0, 55, 330, 3100],
      ["jaragua-hazy-ipa", "New England IPA", 6.8, 42, 500, 3350],
      ["cupuacu-ale", "Amazonian Fruit Ale", 5.8, 15, 500, 2650],
      ["cajupa-sour", "Sour Ale com cajá", 6.5, 8, 500, 2600],
      ["umbu-gose", "Gose com umbu", 4.0, 6, 330, 2750],
      ["graviola-witbier", "Witbier com graviola", 4.8, 12, 500, 2800],
      ["avermelhou", "Red Ale (hibisco e frutas vermelhas)", 5.8, 20, 330, 2900],
      ["rapadura-brown-ale", "Brown Ale com rapadura", 5.5, 24, 330, 2850],
      ["barra-nova-porter", "Robust Porter", 6.4, 35, 330, 3150],
      ["pajucara-amber-ale", "American Amber Ale", 5.0, 25, 330, 2700],
      ["leguele-kolsch", "Kölsch", 4.8, 22, 330, 2490],
      ["leguele-cream-ale", "Cream Ale", 5.2, 18, 330, 2500],
      ["leguele-comendador", "Helles", 4.9, 17, 500, 2590],
      ["ponta-verde-pilsen", "German Pilsner", 4.6, 28, 500, 2390],
    ]);
  });

  it("a Maré Alta traz o exemplo da página de produto: R$ 36,90 para R$ 32,00, 13% de desconto", () => {
    const mareAlta = beers.find((beer) => beer.slug === "mare-alta");

    expect(mareAlta).toMatchObject({ ibu: 65, priceCents: 3200, previousPriceCents: 3690 });
    expect(calcularDesconto(mareAlta?.previousPriceCents, mareAlta?.priceCents ?? 0)).toBe(13);
  });

  it("todas têm descrição, sem o sufixo de texto de exemplo, e só Maré Alta e Cajupá Sour têm preço anterior", () => {
    expect(beers.every((beer) => (beer.description ?? "").length > 0)).toBe(true);
    expect(beers.some((beer) => (beer.description ?? "").includes("(texto de exemplo)"))).toBe(
      false,
    );
    expect(
      beers
        .filter((beer) => beer.previousPriceCents != null)
        .map((beer) => [beer.slug, beer.previousPriceCents]),
    ).toEqual([
      ["mare-alta", 3690],
      ["cajupa-sour", 2990],
    ]);
    expect(
      beers.filter((beer) => calcularDesconto(beer.previousPriceCents, beer.priceCents) !== null),
    ).toHaveLength(2);
  });
});
