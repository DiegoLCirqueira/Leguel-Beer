import { describe, expect, it } from "vitest";
import { calcularFrete, type ConfiguracaoDeEntrega } from "./frete.js";

const config: ConfiguracaoDeEntrega = {
  taxaBaseCentavos: 500,
  valorPorKmCentavos: 150,
  raioMaximoMetros: 25_000,
  freteGratisMinimoCentavos: 15_000,
};

describe("calcularFrete: valor cobrado", () => {
  it.each([
    [5_200, 9_050, 1_300],
    [5_200, 14_999, 1_300],
    [25_000, 9_050, 4_250],
    [0, 9_050, 500],
  ])("distância %i m e subtotal %i dá frete de %i centavos", (distanciaMetros, subtotal, frete) => {
    expect(calcularFrete({ distanciaMetros, subtotalCentavos: subtotal }, config)).toEqual({
      naArea: true,
      freteCentavos: frete,
      gratis: false,
    });
  });
});

describe("calcularFrete: frete grátis", () => {
  it.each([15_000, 15_001, 40_000])("subtotal de %i centavos ou mais não paga frete", (subtotal) => {
    expect(calcularFrete({ distanciaMetros: 5_200, subtotalCentavos: subtotal }, config)).toEqual({
      naArea: true,
      freteCentavos: 0,
      gratis: true,
    });
  });
});

describe("calcularFrete: área de entrega", () => {
  it.each([
    [25_001, 9_050],
    [26_000, 9_050],
    [26_000, 40_000],
  ])("distância de %i m com subtotal %i fica fora da área, até com frete grátis", (d, subtotal) => {
    expect(calcularFrete({ distanciaMetros: d, subtotalCentavos: subtotal }, config)).toEqual({
      naArea: false,
    });
  });
});
