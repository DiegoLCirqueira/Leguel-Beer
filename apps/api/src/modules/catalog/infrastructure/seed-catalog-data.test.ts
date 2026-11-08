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

  it("tem mais de 6 destaques (para exercitar o corte da home) e uma cerveja esgotada", () => {
    expect(beers.filter((beer) => beer.featured).length).toBeGreaterThan(6);
    expect(beers.filter((beer) => beer.stock === 0)).toHaveLength(1);
  });

  it("usa as 9 cervejas do design nas categorias do estilo e completa com 7 de teste", () => {
    const doDesign = SEED_CATEGORIES.map((category) => [
      category.slug,
      category.beers.filter((beer) => !beer.name.startsWith("Teste ")).map((beer) => beer.name),
    ]);

    expect(doDesign).toEqual([
      ["ipa", ["Maré Alta", "Leguelé IPA", "Leguelé Carnaval"]],
      ["frutas", ["Cupuaçu Ale", "Cajupá"]],
      ["malt", ["Avermelhou"]],
      ["lager", ["Cream Ale", "Kölsch", "Leguelé Comendador"]],
    ]);
    expect(beers.filter((beer) => beer.name.startsWith("Teste "))).toHaveLength(7);
    expect(beers.filter((beer) => beer.featured)).toHaveLength(8);
  });

  it("a Maré Alta traz o exemplo da página de produto: IBU 65 e R$ 36,90 para R$ 32,00, 13% de desconto", () => {
    const mareAlta = beers.find((beer) => beer.slug === "mare-alta");

    expect(mareAlta).toMatchObject({ ibu: 65, priceCents: 3200, previousPriceCents: 3690 });
    expect(calcularDesconto(mareAlta?.previousPriceCents, mareAlta?.priceCents ?? 0)).toBe(13);
  });

  it("as 9 cervejas do design têm descrição de exemplo e as de teste ficam sem (a seção some)", () => {
    const doDesign = beers.filter((beer) => !beer.name.startsWith("Teste "));
    const deTeste = beers.filter((beer) => beer.name.startsWith("Teste "));

    expect(doDesign).toHaveLength(9);
    expect(doDesign.every((beer) => (beer.description ?? "").includes("(texto de exemplo)"))).toBe(
      true,
    );
    expect(deTeste.every((beer) => !beer.description)).toBe(true);
  });

  it("tem 3 cervejas com desconto e uma com preço anterior igual ao atual (sem desconto)", () => {
    const comDesconto = beers.filter(
      (beer) => calcularDesconto(beer.previousPriceCents, beer.priceCents) !== null,
    );
    const anteriorIgual = beers.filter(
      (beer) => beer.previousPriceCents != null && beer.previousPriceCents === beer.priceCents,
    );

    expect(comDesconto.map((beer) => beer.slug).sort()).toEqual([
      "cupuacu-ale",
      "leguele-carnaval",
      "mare-alta",
    ]);
    expect(anteriorIgual.map((beer) => beer.slug)).toEqual(["teste-malt-1"]);
  });
});
