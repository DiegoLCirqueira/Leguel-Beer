import { describe, expect, it } from "vitest";
import { formatPriceBRL } from "../format-price.js";
import { descreverParcela, tabelaDeParcelasSchema } from "./parcelas.js";

const opcao = (parcelas: number, valorParcelaCentavos: number, totalCentavos: number) => ({
  parcelas,
  valorParcelaCentavos,
  totalCentavos,
  semJuros: totalCentavos === 15_430,
});

describe("tabelaDeParcelasSchema", () => {
  it("aceita a tabela do gateway, de 1x em diante", () => {
    const tabela = [opcao(1, 15_430, 15_430), opcao(2, 7_715, 15_430), opcao(3, 5_400, 16_200)];

    expect(tabelaDeParcelasSchema.parse(tabela)).toEqual(tabela);
  });

  it("aceita menos parcelas para um total baixo", () => {
    expect(tabelaDeParcelasSchema.safeParse([opcao(1, 1_000, 1_000)]).success).toBe(true);
  });

  it.each([
    ["vazia", []],
    ["sem a parcela 1x", [opcao(2, 7_715, 15_430)]],
    ["com salto", [opcao(1, 15_430, 15_430), opcao(3, 5_400, 16_200)]],
    ["fora de ordem", [opcao(2, 7_715, 15_430), opcao(1, 15_430, 15_430)]],
    ["com 13 parcelas", Array.from({ length: 13 }, (_, i) => opcao(i + 1, 1_000, 13_000))],
    ["com valor em reais quebrados", [{ ...opcao(1, 15_430.5, 15_430), semJuros: true }]],
  ])("recusa tabela %s", (_nome, tabela) => {
    expect(tabelaDeParcelasSchema.safeParse(tabela).success).toBe(false);
  });
});

describe("descreverParcela", () => {
  it("diz 'sem juros' com o valor da parcela", () => {
    expect(descreverParcela(opcao(2, 7_715, 15_430))).toBe(
      `2x de ${formatPriceBRL(7_715)} sem juros`,
    );
  });

  it("mostra a parcela e o total final quando há juros", () => {
    expect(descreverParcela(opcao(3, 5_400, 16_200))).toBe(
      `3x de ${formatPriceBRL(5_400)} (total ${formatPriceBRL(16_200)})`,
    );
  });
});
