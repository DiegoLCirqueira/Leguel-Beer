import { describe, expect, it } from "vitest";
import { cotacaoDeFreteSchema } from "./cotacao.js";

describe("cotacaoDeFreteSchema", () => {
  it("aceita o frete pago e o frete grátis, na área", () => {
    const pago = { naArea: true, freteCentavos: 1300, gratis: false };
    const gratis = { naArea: true, freteCentavos: 0, gratis: true };

    expect(cotacaoDeFreteSchema.parse(pago)).toEqual(pago);
    expect(cotacaoDeFreteSchema.parse(gratis)).toEqual(gratis);
  });

  it("aceita fora da área só com a marca, sem valor de frete", () => {
    expect(cotacaoDeFreteSchema.parse({ naArea: false })).toEqual({ naArea: false });
  });

  it("descarta campos extras: fora da área nunca devolve frete nem distância", () => {
    expect(
      cotacaoDeFreteSchema.parse({ naArea: false, freteCentavos: 1300, distanciaMetros: 26_000 }),
    ).toEqual({ naArea: false });
  });

  it.each([
    ["na área sem valor do frete", { naArea: true, gratis: false }],
    ["na área sem a marca de grátis", { naArea: true, freteCentavos: 1300 }],
    ["frete negativo", { naArea: true, freteCentavos: -1, gratis: false }],
    ["frete fracionário", { naArea: true, freteCentavos: 12.5, gratis: false }],
    ["sem a marca de área", { freteCentavos: 1300, gratis: false }],
  ])("recusa %s", (_nome, corpo) => {
    expect(cotacaoDeFreteSchema.safeParse(corpo).success).toBe(false);
  });
});
