import { describe, expect, it } from "vitest";
import { catalogoQuerySchema } from "./query.js";

describe("catalogoQuerySchema", () => {
  it("sem parâmetros abre o catálogo por relevância e com todas as cervejas", () => {
    expect(catalogoQuerySchema.parse({})).toEqual({ ordem: "relevancia", disponiveis: false });
  });

  it("lê os filtros e a ordenação como chegam na URL, em texto", () => {
    const resultado = catalogoQuerySchema.safeParse({
      categoria: "ipa",
      teor: "4-5-a-6",
      ibu: "20-a-40",
      preco: "25-a-30",
      disponiveis: "true",
      ordem: "menor-preco",
    });

    expect(resultado.data).toEqual({
      categoria: "ipa",
      teor: "4-5-a-6",
      ibu: "20-a-40",
      preco: "25-a-30",
      disponiveis: true,
      ordem: "menor-preco",
    });
  });

  it("ignora valor inválido em vez de rejeitar, e mantém os valores válidos", () => {
    const resultado = catalogoQuerySchema.safeParse({
      categoria: "IPA com espaço",
      teor: "faixa-que-nao-existe",
      ibu: ["20-a-40", "40-ou-mais"],
      preco: "25-a-30",
      disponiveis: "talvez",
      ordem: "mais-vendidos",
    });

    expect(resultado.data).toEqual({ preco: "25-a-30", disponiveis: false, ordem: "relevancia" });
  });
});
