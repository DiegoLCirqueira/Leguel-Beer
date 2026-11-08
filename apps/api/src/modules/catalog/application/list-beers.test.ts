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
});
