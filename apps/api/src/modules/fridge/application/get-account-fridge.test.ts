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
});
