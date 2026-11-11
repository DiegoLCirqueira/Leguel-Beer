import { describe, expect, it } from "vitest";
import { geladeiraResponseSchema } from "./response.js";

const cerveja = (id: string, precoCentavos: number) => ({
  id,
  slug: id,
  nome: id,
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 55,
  volumeMl: 500,
  precoCentavos,
  destaque: false,
  quantidadeDisponivel: 10,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-02T12:00:00.000Z",
});

const resposta = {
  itens: [
    { cerveja: cerveja("mare-alta", 3200), quantidade: 2, totalCentavos: 6400 },
    { cerveja: cerveja("cupuacu-ale", 2650), quantidade: 1, totalCentavos: 2650 },
  ],
  ajustes: [{ tipo: "indisponivel", cervejaId: "cajupa-sour", nome: "Cajupá Sour" }],
  quantidadeTotal: 3,
  subtotalCentavos: 9050,
};

describe("geladeiraResponseSchema", () => {
  it("aceita os itens validados, os ajustes e os totais conferidos", () => {
    expect(geladeiraResponseSchema.parse(resposta)).toEqual(resposta);
  });

  it("recusa a quantidade total que não é a soma das unidades", () => {
    expect(geladeiraResponseSchema.safeParse({ ...resposta, quantidadeTotal: 2 }).success).toBe(
      false,
    );
  });
});
