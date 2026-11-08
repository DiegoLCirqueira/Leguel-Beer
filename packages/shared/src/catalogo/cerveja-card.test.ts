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

  it("recusa teor alcoólico negativo", () => {
    expect(cervejaCardSchema.safeParse({ ...cervejaValida, teorAlcoolico: -0.5 }).success).toBe(
      false,
    );
    expect(cervejaCardSchema.safeParse({ ...cervejaValida, teorAlcoolico: 0 }).success).toBe(true);
  });

  it("aceita imagemUrl como texto", () => {
    const imagemUrl = "/imagens/ipa-aratu.png";

    expect(cervejaCardSchema.parse({ ...cervejaValida, imagemUrl }).imagemUrl).toBe(imagemUrl);
  });

  it("recusa cadastradaEm que não é data ISO", () => {
    expect(
      cervejaCardSchema.safeParse({ ...cervejaValida, cadastradaEm: "02/10/2026" }).success,
    ).toBe(false);
  });

  it("recusa ordem da categoria fracionada", () => {
    const categoria = { ...cervejaValida.categoria, ordem: 1.5 };

    expect(cervejaCardSchema.safeParse({ ...cervejaValida, categoria }).success).toBe(false);
  });
});
