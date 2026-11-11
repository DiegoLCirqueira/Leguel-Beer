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

  it("repetir o mesmo envio dá o mesmo resultado e a mesma Geladeira guardada", async () => {
    const mareAlta = makeBeer({ name: "Maré Alta", priceCents: 3000, stock: 1 });
    const repository = new InMemoryAccountFridgeRepository();
    const save = new SaveAccountFridge(
      new RevalidateFridge(new InMemoryFridgeBeerLookup().add(mareAlta)),
      repository,
    );
    const entries = [{ beerId: mareAlta.id, quantity: 3, seenPriceCents: 3200 }];

    const first = await save.execute("perfil-1", entries);
    const stored = await repository.find("perfil-1");
    const second = await save.execute("perfil-1", entries);

    expect(second).toEqual(first);
    expect(await repository.find("perfil-1")).toEqual(stored);
  });

  it("enviar a Geladeira vazia esvazia a guardada, sem tocar na de outra conta", async () => {
    const mareAlta = makeBeer({ priceCents: 3200 });
    const repository = new InMemoryAccountFridgeRepository();
    const save = new SaveAccountFridge(
      new RevalidateFridge(new InMemoryFridgeBeerLookup().add(mareAlta)),
      repository,
    );
    const entries = [{ beerId: mareAlta.id, quantity: 1, seenPriceCents: 3200 }];
    await save.execute("perfil-1", entries);
    await save.execute("perfil-2", entries);

    await save.execute("perfil-1", []);

    expect(await repository.find("perfil-1")).toEqual([]);
    expect(await repository.find("perfil-2")).toHaveLength(1);
  });
});
