import { describe, expect, it } from "vitest";
import { faixasDeFiltro, pertenceAFaixa, type Faixa } from "./faixas.js";

function idsDasFaixasDe(faixas: readonly Faixa[], valor: number): string[] {
  return faixas.filter((faixa) => pertenceAFaixa(faixa, valor)).map((faixa) => faixa.id);
}

describe("faixasDeFiltro.teor", () => {
  it("tem as 3 faixas da spec, com id e rótulo", () => {
    expect(faixasDeFiltro.teor.map(({ id, rotulo }) => [id, rotulo])).toEqual([
      ["abaixo-de-4-5", "Abaixo de 4,5%"],
      ["4-5-a-6", "4,5% a menos de 6%"],
      ["6-ou-mais", "6% ou mais"],
    ]);
  });

  it("inclui o limite inferior e exclui o superior: 4,5 e 6 caem na faixa que começa neles", () => {
    expect(idsDasFaixasDe(faixasDeFiltro.teor, 4.4)).toEqual(["abaixo-de-4-5"]);
    expect(idsDasFaixasDe(faixasDeFiltro.teor, 4.5)).toEqual(["4-5-a-6"]);
    expect(idsDasFaixasDe(faixasDeFiltro.teor, 5.9)).toEqual(["4-5-a-6"]);
    expect(idsDasFaixasDe(faixasDeFiltro.teor, 6)).toEqual(["6-ou-mais"]);
    expect(idsDasFaixasDe(faixasDeFiltro.teor, 9)).toEqual(["6-ou-mais"]);
  });
});

describe("faixasDeFiltro.ibu", () => {
  it("tem as 3 faixas da spec, com id e rótulo", () => {
    expect(faixasDeFiltro.ibu.map(({ id, rotulo }) => [id, rotulo])).toEqual([
      ["abaixo-de-20", "Abaixo de 20"],
      ["20-a-40", "20 a menos de 40"],
      ["40-ou-mais", "40 ou mais"],
    ]);
  });

  it("inclui o limite inferior e exclui o superior: 20 e 40 caem na faixa que começa neles", () => {
    expect(idsDasFaixasDe(faixasDeFiltro.ibu, 19)).toEqual(["abaixo-de-20"]);
    expect(idsDasFaixasDe(faixasDeFiltro.ibu, 20)).toEqual(["20-a-40"]);
    expect(idsDasFaixasDe(faixasDeFiltro.ibu, 39)).toEqual(["20-a-40"]);
    expect(idsDasFaixasDe(faixasDeFiltro.ibu, 40)).toEqual(["40-ou-mais"]);
  });
});

describe("faixasDeFiltro.preco", () => {
  it("tem as 3 faixas da spec, com id e rótulo", () => {
    expect(faixasDeFiltro.preco.map(({ id, rotulo }) => [id, rotulo])).toEqual([
      ["abaixo-de-25", "Abaixo de R$ 25"],
      ["25-a-30", "R$ 25 a menos de R$ 30"],
      ["30-ou-mais", "R$ 30 ou mais"],
    ]);
  });

  it("compara em centavos: R$ 25 e R$ 30 caem na faixa que começa neles", () => {
    expect(idsDasFaixasDe(faixasDeFiltro.preco, 2499)).toEqual(["abaixo-de-25"]);
    expect(idsDasFaixasDe(faixasDeFiltro.preco, 2500)).toEqual(["25-a-30"]);
    expect(idsDasFaixasDe(faixasDeFiltro.preco, 2999)).toEqual(["25-a-30"]);
    expect(idsDasFaixasDe(faixasDeFiltro.preco, 3000)).toEqual(["30-ou-mais"]);
  });
});
