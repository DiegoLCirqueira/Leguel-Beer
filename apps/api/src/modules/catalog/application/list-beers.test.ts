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

  it("conta as cervejas ativas por categoria, esgotadas incluÃ­das, na ordem das categorias e sem as vazias", async () => {
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
});
