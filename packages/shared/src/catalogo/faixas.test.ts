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
