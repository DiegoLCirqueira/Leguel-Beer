import { describe, expect, it } from "vitest";
import { catalogoResponseSchema } from "./response.js";

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

const resposta = {
  itens: [card],
  total: 1,
  categorias: [
    { slug: "ipa", nome: "IPAs", ordem: 1, quantidade: 6 },
    { slug: "lager", nome: "Lagers", ordem: 4, quantidade: 4 },
  ],
};

describe("catalogoResponseSchema", () => {
  it("aceita os itens, o total e as categorias com ordem e contador", () => {
    expect(catalogoResponseSchema.parse(resposta)).toEqual(resposta);
  });
});
