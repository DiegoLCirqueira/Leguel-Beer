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
});
