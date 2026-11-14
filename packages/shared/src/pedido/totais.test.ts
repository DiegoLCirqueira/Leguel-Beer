import { describe, expect, it } from "vitest";
import type { ConfiguracaoDeEntrega } from "../entrega/frete.js";
import { calcularTotais } from "./totais.js";

const config: ConfiguracaoDeEntrega = {
  taxaBaseCentavos: 500,
  valorPorKmCentavos: 150,
  raioMaximoMetros: 25_000,
  freteGratisMinimoCentavos: 15_000,
};

describe("calcularTotais", () => {
  it("soma o subtotal e o frete (R$ 149,00 + R$ 13,00 = R$ 162,00)", () => {
    // 5 km: 5,00 + 7,50 = 12,50, arredondado para R$ 13,00.
    expect(calcularTotais({ distanciaMetros: 5_000, subtotalCentavos: 14_900 }, config)).toEqual({
      naArea: true,
      subtotalCentavos: 14_900,
      freteCentavos: 1_300,
      totalCentavos: 16_200,
    });
  });

  it("zera o frete a partir de R$ 150,00 e o total é o subtotal", () => {
    expect(calcularTotais({ distanciaMetros: 5_000, subtotalCentavos: 15_000 }, config)).toEqual({
      naArea: true,
      subtotalCentavos: 15_000,
      freteCentavos: 0,
      totalCentavos: 15_000,
    });
  });

  it("não calcula total para endereço fora da área", () => {
    expect(calcularTotais({ distanciaMetros: 25_001, subtotalCentavos: 5_000 }, config)).toEqual({
      naArea: false,
    });
  });

  it("repassa a recusa de entrada inválida", () => {
    expect(() =>
      calcularTotais({ distanciaMetros: 1_000, subtotalCentavos: -1 }, config),
    ).toThrow(RangeError);
  });
});
