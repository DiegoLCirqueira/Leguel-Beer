import { describe, expect, it } from "vitest";
import { destaquesResponseSchema } from "./destaques.js";

const card = {
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

describe("destaquesResponseSchema", () => {
  it("aceita a lista de cards em destaque", () => {
    expect(destaquesResponseSchema.parse({ itens: [card, card] })).toEqual({ itens: [card, card] });
  });

  it("recusa mais de 6 destaques", () => {
    const seteDestaques = { itens: Array.from({ length: 7 }, () => card) };

    expect(destaquesResponseSchema.safeParse(seteDestaques).success).toBe(false);
    expect(destaquesResponseSchema.safeParse({ itens: Array(6).fill(card) }).success).toBe(true);
  });
});
