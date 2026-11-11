import { describe, expect, it } from "vitest";
import { ajusteDaGeladeiraSchema } from "./ajuste.js";

describe("ajusteDaGeladeiraSchema", () => {
  it("aceita o ajuste de preço que mudou, com o preço visto e o atual", () => {
    const ajuste = {
      tipo: "preco-mudou",
      cervejaId: "cerveja-1",
      nome: "Maré Alta",
      precoVistoCentavos: 3200,
      precoAtualCentavos: 3000,
    };

    expect(ajusteDaGeladeiraSchema.parse(ajuste)).toEqual(ajuste);
  });

  it("aceita o ajuste de quantidade reduzida, de 1 até a anterior menos 1", () => {
    const ajuste = {
      tipo: "quantidade-reduzida",
      cervejaId: "cerveja-1",
      nome: "Maré Alta",
      quantidadeAnterior: 2,
      quantidadeAtual: 1,
    };

    expect(ajusteDaGeladeiraSchema.parse(ajuste)).toEqual(ajuste);
  });

  const reduzida = (quantidadeAtual: number) => ({
    tipo: "quantidade-reduzida",
    cervejaId: "cerveja-1",
    nome: "Maré Alta",
    quantidadeAnterior: 3,
    quantidadeAtual,
  });

  it.each([0, 3, 4])("recusa a quantidade atual %i quando a anterior é 3", (quantidadeAtual) => {
    expect(ajusteDaGeladeiraSchema.safeParse(reduzida(quantidadeAtual)).success).toBe(false);
  });

  it("aceita a quantidade atual 2 quando a anterior é 3", () => {
    expect(ajusteDaGeladeiraSchema.safeParse(reduzida(2)).success).toBe(true);
  });

  it.each(["Maré Alta", null])("aceita o ajuste de cerveja indisponível com o nome %s", (nome) => {
    const ajuste = { tipo: "indisponivel", cervejaId: "cerveja-1", nome };

    expect(ajusteDaGeladeiraSchema.parse(ajuste)).toEqual(ajuste);
  });
});
