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

  it("2 unidades de um rótulo deixam 2 garrafas fantasma nas colunas livres", () => {
    const p = arrumarPrateleira([mare(2)]);

    expect(posicoes(p)).toEqual(["mare:0:0", "mare:1:0"]);
    expect(p.fantasmas).toEqual([2, 3]);
  });

  it("com 2 rótulos cada um vira uma fila na ordem de entrada, e os fantasmas são 4 menos os rótulos", () => {
    const p = arrumarPrateleira([mare(3), carnaval(1)]);

    expect(posicoes(p)).toEqual(["mare:0:0", "mare:0:1", "mare:0:2", "carnaval:1:0"]);
    expect(p.fantasmas).toEqual([2, 3]);
  });
});
