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

  it("tira a cerveja desativada da Geladeira e avisa que não está mais disponível", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3200, stock: 10 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta, { active: false });

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);

    expect(result.items).toEqual([]);
    expect(result.adjustments).toEqual([
      { type: "unavailable", beerId: mareAlta.id, name: "Maré Alta" },
    ]);
  });

  it("tira a cerveja esgotada da Geladeira e avisa que não está mais disponível", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3200, stock: 0 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta);

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);

    expect(result.items).toEqual([]);
    expect(result.adjustments).toEqual([
      { type: "unavailable", beerId: mareAlta.id, name: "Maré Alta" },
    ]);
  });

  it("tira a cerveja que não existe e avisa sem nome, porque não há o que mostrar", async () => {
    const lookup = new InMemoryFridgeBeerLookup().add(makeBeer());

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: "nao-existe", quantity: 1, seenPriceCents: 3200 },
    ]);

    expect(result.items).toEqual([]);
    expect(result.adjustments).toEqual([
      { type: "unavailable", beerId: "nao-existe", name: null },
    ]);
  });

  it("usa o preço atual e avisa quando o preço mudou desde que o cliente viu", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3000, stock: 10 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta);

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);

    expect(result.items).toEqual([{ beer: mareAlta, quantity: 2 }]);
    expect(result.adjustments).toEqual([
      {
        type: "price-changed",
        beerId: mareAlta.id,
        name: "Maré Alta",
        seenPriceCents: 3200,
        currentPriceCents: 3000,
      },
    ]);
  });
});
