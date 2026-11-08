import { describe, expect, it } from "vitest";
import { NotFoundError } from "../../../common/errors/not-found-error.js";
import { makeBeer } from "../testing/beers.js";
import { InMemoryBeerRepository } from "../testing/in-memory-beers.js";
import { GetBeer } from "./get-beer.js";

describe("GetBeer", () => {
  it("devolve a cerveja do slug", async () => {
    const mareAlta = makeBeer({ slug: "mare-alta", name: "Maré Alta" });
    const repository = new InMemoryBeerRepository([makeBeer(), mareAlta]);

    expect(await new GetBeer(repository).execute("mare-alta")).toBe(mareAlta);
  });

  it("slug sem cerveja ativa (inexistente ou inativa) é NotFoundError", async () => {
    const repository = new InMemoryBeerRepository([makeBeer({ slug: "outra" })]);

    await expect(new GetBeer(repository).execute("mare-alta")).rejects.toThrow(NotFoundError);
  });
});
