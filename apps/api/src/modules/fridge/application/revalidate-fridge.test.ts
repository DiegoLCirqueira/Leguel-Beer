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

  it("reduz a quantidade à disponível e avisa quando o cliente pediu mais do que há", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3200, stock: 1 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta);

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);

    expect(result.items).toEqual([{ beer: mareAlta, quantity: 1 }]);
    expect(result.adjustments).toEqual([
      {
        type: "quantity-reduced",
        beerId: mareAlta.id,
        name: "Maré Alta",
        previousQuantity: 2,
        currentQuantity: 1,
      },
    ]);
  });

  it("junta os quatro ajustes e mantém a ordem em que as cervejas entraram", async () => {
    const zeta = makeBeer({ name: "Zeta", priceCents: 3000, stock: 10 });
    const alfa = makeBeer({ name: "Alfa", priceCents: 2800, stock: 1 });
    const mike = makeBeer({ name: "Mike", priceCents: 2500, stock: 10 });
    const omega = makeBeer({ name: "Omega", priceCents: 2500, stock: 10 });
    const lookup = new InMemoryFridgeBeerLookup()
      .add(alfa)
      .add(omega, { active: false })
      .add(mike)
      .add(zeta);

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: zeta.id, quantity: 2, seenPriceCents: 3200 },
      { beerId: "fantasma", quantity: 1, seenPriceCents: 2000 },
      { beerId: alfa.id, quantity: 3, seenPriceCents: 2800 },
      { beerId: omega.id, quantity: 1, seenPriceCents: 2500 },
      { beerId: mike.id, quantity: 4, seenPriceCents: 2500 },
    ]);

    expect(result.items.map(({ beer, quantity }) => [beer.name, quantity])).toEqual([
      ["Zeta", 2],
      ["Alfa", 1],
      ["Mike", 4],
    ]);
    expect(result.adjustments.map((adjustment) => adjustment.type)).toEqual([
      "price-changed",
      "unavailable",
      "quantity-reduced",
      "unavailable",
    ]);
    expect(result.adjustments.map((adjustment) => adjustment.beerId)).toEqual([
      zeta.id,
      "fantasma",
      alfa.id,
      omega.id,
    ]);
  });

  it("avisa o preço e a quantidade da mesma cerveja, o preço primeiro", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3000, stock: 1 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta);

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);

    expect(result.adjustments.map((adjustment) => adjustment.type)).toEqual([
      "price-changed",
      "quantity-reduced",
    ]);
  });

  it("tira a cerveja que não existe e avisa sem nome, porque não há o que mostrar", async () => {
    const lookup = new InMemoryFridgeBeerLookup().add(makeBeer());

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: "nao-existe", quantity: 1, seenPriceCents: 3200 },
    ]);

    expect(result.items).toEqual([]);
    expect(result.adjustments).toEqual([{ type: "unavailable", beerId: "nao-existe", name: null }]);
  });

  it("reconhece o id em maiúsculas: o UUID é o mesmo e o aviso devolve o id em minúsculas", async () => {
    const mareAlta = makeBeer({ id: "0a1b2c3d-0000-4000-8000-00000000abcd", priceCents: 3200 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta);

    const result = await new RevalidateFridge(lookup).execute([
      { beerId: mareAlta.id.toUpperCase(), quantity: 2, seenPriceCents: 3200 },
      { beerId: "NAO-EXISTE", quantity: 1, seenPriceCents: 3200 },
    ]);

    expect(result.items).toEqual([{ beer: mareAlta, quantity: 2 }]);
    expect(result.adjustments).toEqual([{ type: "unavailable", beerId: "nao-existe", name: null }]);
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
