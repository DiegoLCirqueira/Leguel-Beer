import { describe, expect, it } from "vitest";
import { makeBeer } from "../../catalog/testing/beers.js";
import { InMemoryFridgeBeerLookup } from "../testing/in-memory-fridge-beers.js";
import { RevalidateFridge } from "./revalidate-fridge.js";

describe("RevalidateFridge", () => {
  it("mantém o item sem aviso quando preço, estoque e situação não mudaram", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3200, stock: 10 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta);

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);

    expect(result).toEqual({ items: [{ beer: mareAlta, quantity: 2 }], adjustments: [] });
  });
});
