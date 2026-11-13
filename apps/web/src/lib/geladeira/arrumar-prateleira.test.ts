import { describe, expect, it } from "vitest";
import { arrumarPrateleira } from "./arrumar-prateleira";

const mare = (quantidade: number) => ({ cervejaId: "mare", nome: "Maré Alta", quantidade });
const carnaval = (quantidade: number) => ({
  cervejaId: "carnaval",
  nome: "Leguelé Carnaval",
  quantidade,
});

/** Posição de cada garrafa como "cerveja:coluna:fileira", para comparar a arrumação inteira. */
const posicoes = (p: ReturnType<typeof arrumarPrateleira>) =>
  p.garrafas.map((g) => `${g.cervejaId}:${g.coluna}:${g.fileira}`);

describe("arrumarPrateleira", () => {
  it("4 unidades de um rótulo ficam lado a lado, sem garrafa fantasma", () => {
    const p = arrumarPrateleira([mare(4)]);

    expect(posicoes(p)).toEqual(["mare:0:0", "mare:1:0", "mare:2:0", "mare:3:0"]);
    expect(p.fantasmas).toEqual([]);
  });
});
