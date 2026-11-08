import type { CatalogoQuery } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { contarFiltros, paraQueryString } from "./url";

const padrao: CatalogoQuery = { disponiveis: false, ordem: "relevancia" };

describe("paraQueryString", () => {
  it("sem filtros e na ordem padrão a URL fica limpa", () => {
    expect(paraQueryString(padrao)).toBe("");
  });

  it("leva só o que foge do padrão, em ordem estável", () => {
    const query: CatalogoQuery = {
      categoria: "ipa",
      teor: "6-ou-mais",
      ibu: "20-a-40",
      preco: "25-a-30",
      disponiveis: true,
      ordem: "menor-preco",
    };

    expect(paraQueryString(query)).toBe(
      "categoria=ipa&teor=6-ou-mais&ibu=20-a-40&preco=25-a-30&disponiveis=true&ordem=menor-preco",
    );
  });
});

describe("contarFiltros", () => {
  it("conta teor, IBU, preço e só disponíveis, mas não a categoria nem a ordem", () => {
    expect(contarFiltros(padrao)).toBe(0);
    expect(
      contarFiltros({ ...padrao, categoria: "ipa", ordem: "maior-preco", teor: "6-ou-mais" }),
    ).toBe(1);
    expect(
      contarFiltros({
        ...padrao,
        teor: "6-ou-mais",
        ibu: "20-a-40",
        preco: "30-ou-mais",
        disponiveis: true,
      }),
    ).toBe(4);
  });
});
