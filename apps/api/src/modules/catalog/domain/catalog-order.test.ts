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

  it("menor preço: do mais barato ao mais caro, e o empate cai na relevância", () => {
    const barata = makeBeer({ name: "Lager Barata", category: CATEGORIES.lager, priceCents: 2000 });
    const caraA = makeBeer({ name: "IPA A", category: CATEGORIES.ipa, priceCents: 3200 });
    const caraB = makeBeer({ name: "Frutas B", category: CATEGORIES.frutas, priceCents: 3200 });

    expect(names(sortBeers([caraB, barata, caraA], "menor-preco"))).toEqual([
      "Lager Barata",
      "IPA A",
      "Frutas B",
    ]);
  });

  it("relevância não olha o preço: um destaque caro vem antes de uma cerveja barata", () => {
    const destaqueCaro = makeBeer({ name: "Destaque Caro", featured: true, priceCents: 4000 });
    const baratinha = makeBeer({ name: "Baratinha", priceCents: 1500 });

    expect(names(sortBeers([baratinha, destaqueCaro], "relevancia"))).toEqual([
      "Destaque Caro",
      "Baratinha",
    ]);
  });

  it("maior preço: do mais caro ao mais barato, e o empate cai na relevância", () => {
    const cara = makeBeer({ name: "Lager Cara", category: CATEGORIES.lager, priceCents: 4000 });
    const barataA = makeBeer({ name: "IPA A", category: CATEGORIES.ipa, priceCents: 2000 });
    const barataB = makeBeer({ name: "Frutas B", category: CATEGORIES.frutas, priceCents: 2000 });

    expect(names(sortBeers([barataB, cara, barataA], "maior-preco"))).toEqual([
      "Lager Cara",
      "IPA A",
      "Frutas B",
    ]);
  });

  it("esgotadas sempre no fim, mesmo a mais barata ou em destaque; a ordem vale dentro de cada grupo", () => {
    const esgotadaBarata = makeBeer({ name: "Esgotada Barata", stock: 0, priceCents: 1000 });
    const esgotadaDestaque = makeBeer({ name: "Esgotada Destaque", stock: 0, featured: true });
    const disponivelCara = makeBeer({ name: "Disponível Cara", priceCents: 4000 });
    const disponivelBarata = makeBeer({ name: "Disponível Barata", priceCents: 2000 });
    const todas = [esgotadaBarata, disponivelCara, esgotadaDestaque, disponivelBarata];

    expect(names(sortBeers(todas, "menor-preco"))).toEqual([
      "Disponível Barata",
      "Disponível Cara",
      "Esgotada Barata",
      "Esgotada Destaque",
    ]);
    expect(names(sortBeers(todas, "relevancia"))).toEqual([
      "Disponível Barata",
      "Disponível Cara",
      "Esgotada Destaque",
      "Esgotada Barata",
    ]);
  });
});
