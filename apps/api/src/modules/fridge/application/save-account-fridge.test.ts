import { describe, expect, it } from "vitest";
import { makeBeer } from "../../catalog/testing/beers.js";
import { InMemoryAccountFridgeRepository } from "../testing/in-memory-account-fridge.js";
import { InMemoryFridgeBeerLookup } from "../testing/in-memory-fridge-beers.js";
import { RevalidateFridge } from "./revalidate-fridge.js";
import { SaveAccountFridge } from "./save-account-fridge.js";

describe("SaveAccountFridge", () => {
  it("guarda a Geladeira revalidada, na ordem de entrada, e devolve o resultado da revalidação", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3000, stock: 10 });
    const ponta = makeBeer({ name: "Ponta Verde", priceCents: 2800, stock: 10 });
    const velha = makeBeer({ name: "Velha", priceCents: 2800, stock: 10 });
    const lookup = new InMemoryFridgeBeerLookup()
      .add(mareAlta)
      .add(ponta)
      .add(velha, { active: false });
    const repository = new InMemoryAccountFridgeRepository();

    const result = await new SaveAccountFridge(new RevalidateFridge(lookup), repository).execute(
      "perfil-1",
      [
        { beerId: ponta.id, quantity: 1, seenPriceCents: 2800 },
        { beerId: velha.id, quantity: 1, seenPriceCents: 2800 },
        { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
      ],
    );

    expect(await repository.find("perfil-1")).toEqual([
      { beerId: ponta.id, quantity: 1, seenPriceCents: 2800 },
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3000 },
    ]);
    expect(result.items.map((item) => item.beer.id)).toEqual([ponta.id, mareAlta.id]);
    expect(result.adjustments.map((adjustment) => adjustment.type)).toEqual([
      "unavailable",
      "price-changed",
    ]);
  });
});
