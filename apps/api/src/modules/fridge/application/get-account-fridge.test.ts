import { describe, expect, it } from "vitest";
import { makeBeer } from "../../catalog/testing/beers.js";
import { InMemoryAccountFridgeRepository } from "../testing/in-memory-account-fridge.js";
import { InMemoryFridgeBeerLookup } from "../testing/in-memory-fridge-beers.js";
import { GetAccountFridge } from "./get-account-fridge.js";
import { RevalidateFridge } from "./revalidate-fridge.js";

describe("GetAccountFridge", () => {
  it("devolve a Geladeira vazia para a conta que nunca guardou nada", async () => {
    const get = new GetAccountFridge(
      new RevalidateFridge(new InMemoryFridgeBeerLookup()),
      new InMemoryAccountFridgeRepository(),
    );

    expect(await get.execute("perfil-1")).toEqual({ items: [], adjustments: [] });
  });

  it("grava os ajustes: a Geladeira guardada passa a ser a revalidada e o aviso não se repete", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3000, stock: 10 });
    const velha = makeBeer({ name: "Velha", priceCents: 2800, stock: 10 });
    const lookup = new InMemoryFridgeBeerLookup().add(mareAlta).add(velha, { active: false });
    const repository = new InMemoryAccountFridgeRepository();
    await repository.replace("perfil-1", [
      { beerId: velha.id, quantity: 1, seenPriceCents: 2800 },
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);
    const get = new GetAccountFridge(new RevalidateFridge(lookup), repository);

    const first = await get.execute("perfil-1");
    const second = await get.execute("perfil-1");

    expect(first.adjustments.map((adjustment) => adjustment.type)).toEqual([
      "unavailable",
      "price-changed",
    ]);
    expect(await repository.find("perfil-1")).toEqual([
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3000 },
    ]);
    expect(second.adjustments).toEqual([]);
    expect(second.items).toEqual(first.items);
  });

  it("não grava nada quando a revalidação não ajusta nada", async () => {
    const mareAlta = makeBeer({ priceCents: 3200, stock: 10 });
    const repository = new InMemoryAccountFridgeRepository();
    await repository.replace("perfil-1", [
      { beerId: mareAlta.id, quantity: 2, seenPriceCents: 3200 },
    ]);
    const writesBefore = repository.replaceCalls;

    const result = await new GetAccountFridge(
      new RevalidateFridge(new InMemoryFridgeBeerLookup().add(mareAlta)),
      repository,
    ).execute("perfil-1");

    expect(result.items).toEqual([{ beer: mareAlta, quantity: 2 }]);
    expect(repository.replaceCalls).toBe(writesBefore);
  });
});
