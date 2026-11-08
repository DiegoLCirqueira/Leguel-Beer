import { describe, expect, it } from "vitest";
import { CATEGORIES, makeBeer } from "../testing/beers.js";
import { sortBeers } from "./catalog-order.js";

const names = (beers: readonly { name: string }[]) => beers.map((beer) => beer.name);

describe("sortBeers", () => {
  const lagerPraia = makeBeer({
    name: "Lager Praia",
    category: CATEGORIES.lager,
    featured: true,
    createdAt: new Date("2026-10-01T12:00:00Z"),
  });
  const ipaZabumba = makeBeer({
    name: "IPA Zabumba",
    category: CATEGORIES.ipa,
    createdAt: new Date("2026-10-03T12:00:00Z"),
  });
  const ipaAratu = makeBeer({
    name: "IPA Aratu",
    category: CATEGORIES.ipa,
    createdAt: new Date("2026-10-02T12:00:00Z"),
  });
  const frutasCaju = makeBeer({
    name: "Frutas Caju",
    category: CATEGORIES.frutas,
    createdAt: new Date("2026-10-04T12:00:00Z"),
  });
  const embaralhadas = [frutasCaju, lagerPraia, ipaZabumba, ipaAratu];

  it("relevância: destaques primeiro, depois a ordem das categorias e por fim o nome", () => {
    expect(names(sortBeers(embaralhadas, "relevancia"))).toEqual([
      "Lager Praia",
      "IPA Aratu",
      "IPA Zabumba",
      "Frutas Caju",
    ]);
  });

  it("mais novas: pela data de cadastro, da mais recente para a mais antiga", () => {
    expect(names(sortBeers(embaralhadas, "mais-novas"))).toEqual([
      "Frutas Caju",
      "IPA Zabumba",
      "IPA Aratu",
      "Lager Praia",
    ]);
  });

  it("menor preÃ§o: do mais barato ao mais caro, e o empate cai na relevÃ¢ncia", () => {
    const barata = makeBeer({ name: "Lager Barata", category: CATEGORIES.lager, priceCents: 2000 });
    const caraA = makeBeer({ name: "IPA A", category: CATEGORIES.ipa, priceCents: 3200 });
    const caraB = makeBeer({ name: "Frutas B", category: CATEGORIES.frutas, priceCents: 3200 });

    expect(names(sortBeers([caraB, barata, caraA], "menor-preco"))).toEqual([
      "Lager Barata",
      "IPA A",
      "Frutas B",
    ]);
  });
});
