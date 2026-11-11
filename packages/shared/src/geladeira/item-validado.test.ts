import { describe, expect, it } from "vitest";
import { itemValidadoSchema } from "./item-validado.js";

const cerveja = {
  id: "cerveja-1",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 55,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-02T12:00:00.000Z",
};

const item = { cerveja, quantidade: 2, totalCentavos: 6400 };

describe("itemValidadoSchema", () => {
  it("aceita a cerveja, a quantidade e o total da linha", () => {
    expect(itemValidadoSchema.parse(item)).toEqual(item);
  });

  it.each([0, 6])("recusa a quantidade %i: vai de 1 até a quantidade disponível (5)", (quantidade) => {
    const invalido = { ...item, quantidade, totalCentavos: quantidade * 3200 };

    expect(itemValidadoSchema.safeParse(invalido).success).toBe(false);
  });

  it("recusa o total que não é a quantidade vezes o preço da cerveja", () => {
    expect(itemValidadoSchema.safeParse({ ...item, totalCentavos: 6000 }).success).toBe(false);
  });

  it("aceita a quantidade igual à disponível", () => {
    const noLimite = { ...item, quantidade: 5, totalCentavos: 16000 };

    expect(itemValidadoSchema.safeParse(noLimite).success).toBe(true);
  });
});
