import { describe, expect, it } from "vitest";
import { cervejaCardSchema } from "./cerveja-card.js";

const cervejaValida = {
  id: "cerveja-1",
  slug: "ipa-aratu",
  nome: "IPA Aratu",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 55,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 12,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-02T12:00:00.000Z",
};

describe("cervejaCardSchema", () => {
  it("aceita o card completo, com a categoria aninhada e a imagem nula", () => {
    expect(cervejaCardSchema.parse(cervejaValida)).toEqual(cervejaValida);
  });

  it("recusa preço fracionado, quantidade negativa e IBU ou volume fracionados", () => {
    const recusa = (campos: object) =>
      cervejaCardSchema.safeParse({ ...cervejaValida, ...campos }).success;

    expect(recusa({ precoCentavos: 32.5 })).toBe(false);
    expect(recusa({ precoCentavos: -1 })).toBe(false);
    expect(recusa({ quantidadeDisponivel: -1 })).toBe(false);
    expect(recusa({ ibu: 55.5 })).toBe(false);
    expect(recusa({ volumeMl: 500.5 })).toBe(false);
  });

  it("exige esgotada verdadeira só quando a quantidade disponível é 0", () => {
    const recusa = (campos: object) =>
      cervejaCardSchema.safeParse({ ...cervejaValida, ...campos }).success;

    expect(recusa({ quantidadeDisponivel: 0, esgotada: true })).toBe(true);
    expect(recusa({ quantidadeDisponivel: 0, esgotada: false })).toBe(false);
    expect(recusa({ quantidadeDisponivel: 3, esgotada: true })).toBe(false);
  });
});
