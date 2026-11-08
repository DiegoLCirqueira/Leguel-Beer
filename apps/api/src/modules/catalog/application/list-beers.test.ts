import { catalogoQuerySchema } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { CATEGORIES, makeBeer } from "../testing/beers.js";
import { InMemoryBeerRepository } from "../testing/in-memory-beers.js";
import { ListBeers } from "./list-beers.js";

const names = (beers: readonly { name: string }[]) => beers.map((beer) => beer.name);
const query = (params: Record<string, unknown> = {}) => catalogoQuerySchema.parse(params);

describe("ListBeers", () => {
  it("sem filtros lista todas as cervejas ativas por relevância, com o total", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "Lager Sol", category: CATEGORIES.lager }),
      makeBeer({ name: "IPA Aratu", category: CATEGORIES.ipa }),
      makeBeer({ name: "Frutas Caju", category: CATEGORIES.frutas, featured: true }),
    ]);

    const result = await new ListBeers(repository).execute(query());

    expect(names(result.items)).toEqual(["Frutas Caju", "IPA Aratu", "Lager Sol"]);
    expect(result.total).toBe(3);
  });

  it("conta as cervejas ativas por categoria, esgotadas incluídas, na ordem das categorias e sem as vazias", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ category: CATEGORIES.lager }),
      makeBeer({ category: CATEGORIES.ipa }),
      makeBeer({ category: CATEGORIES.ipa, stock: 0 }),
      makeBeer({ category: CATEGORIES.ipa }),
    ]);

    const result = await new ListBeers(repository).execute(query());

    expect(result.categories).toEqual([
      { slug: "ipa", name: "IPAs", order: 1, quantity: 3 },
      { slug: "lager", name: "Lager", order: 4, quantity: 1 },
    ]);
  });

  it("filtra pela categoria da query, e os contadores continuam os de todas as categorias", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "IPA 1", category: CATEGORIES.ipa }),
      makeBeer({ name: "IPA 2", category: CATEGORIES.ipa }),
      makeBeer({ name: "Lager 1", category: CATEGORIES.lager }),
    ]);

    const result = await new ListBeers(repository).execute(query({ categoria: "ipa" }));

    expect(names(result.items)).toEqual(["IPA 1", "IPA 2"]);
    expect(result.total).toBe(2);
    expect(result.categories.map((c) => [c.slug, c.quantity])).toEqual([
      ["ipa", 2],
      ["lager", 1],
    ]);
  });

  it("traduz a faixa de teor da query: 4,5 entra em '4,5% a menos de 6%' e 6 já é '6% ou mais'", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "4,4", abv: 4.4 }),
      makeBeer({ name: "4,5", abv: 4.5 }),
      makeBeer({ name: "5,9", abv: 5.9 }),
      makeBeer({ name: "6", abv: 6 }),
    ]);

    const result = await new ListBeers(repository).execute(query({ teor: "4-5-a-6" }));

    expect(names(result.items).sort()).toEqual(["4,5", "5,9"]);
  });

  it("traduz as faixas de IBU e de preço da query", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "A", ibu: 20, priceCents: 2500 }),
      makeBeer({ name: "B", ibu: 40, priceCents: 2500 }),
      makeBeer({ name: "C", ibu: 20, priceCents: 3000 }),
      makeBeer({ name: "D", ibu: 19, priceCents: 2499 }),
    ]);

    const porIbu = await new ListBeers(repository).execute(query({ ibu: "20-a-40" }));
    const porPreco = await new ListBeers(repository).execute(query({ preco: "25-a-30" }));

    expect(names(porIbu.items).sort()).toEqual(["A", "C"]);
    expect(names(porPreco.items).sort()).toEqual(["A", "B"]);
  });

  it("só disponíveis esconde as esgotadas, mas elas continuam nos contadores", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "Disponível", stock: 4 }),
      makeBeer({ name: "Esgotada", stock: 0 }),
    ]);

    const result = await new ListBeers(repository).execute(query({ disponiveis: "true" }));

    expect(names(result.items)).toEqual(["Disponível"]);
    expect(result.categories[0]?.quantity).toBe(2);
  });

  it("ordena pela ordem da query, com as esgotadas no fim", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "A Cara", priceCents: 4000 }),
      makeBeer({ name: "Esgotada barata", priceCents: 1000, stock: 0 }),
      makeBeer({ name: "Z Barata", priceCents: 2000 }),
    ]);

    const result = await new ListBeers(repository).execute(query({ ordem: "menor-preco" }));

    expect(names(result.items)).toEqual(["Z Barata", "A Cara", "Esgotada barata"]);
  });

  it("categoria que não existe no catálogo é ignorada, como qualquer parâmetro inválido", async () => {
    const repository = new InMemoryBeerRepository([
      makeBeer({ name: "IPA", category: CATEGORIES.ipa }),
      makeBeer({ name: "Lager", category: CATEGORIES.lager }),
    ]);

    const result = await new ListBeers(repository).execute(query({ categoria: "stout" }));

    expect(names(result.items)).toEqual(["IPA", "Lager"]);
  });
});
