import { describe, expect, it } from "vitest";
import {
  estoqueBaixoNoAdmin,
  historicoDoEstoqueSchema,
  itemDoEstoqueSchema,
} from "./estoque-lista.js";

describe("estoqueBaixoNoAdmin", () => {
  it.each([
    [7, 6, false],
    [6, 6, true],
    [5, 6, true],
    [0, 0, true],
    [-1, 0, true],
  ])("disponível %i com mínimo %i: baixo = %s", (disponivel, minimo, esperado) => {
    expect(estoqueBaixoNoAdmin(disponivel, minimo)).toBe(esperado);
  });
});

describe("itemDoEstoqueSchema", () => {
  const ITEM = {
    cervejaId: "1",
    nome: "Maré Alta",
    fisico: 10,
    reservado: 4,
    disponivel: 6,
    minimo: 6,
    baixo: true,
  };

  it("aceita o item coerente", () => {
    expect(itemDoEstoqueSchema.safeParse(ITEM).success).toBe(true);
  });

  it("recusa disponível que não é físico menos reservado", () => {
    expect(itemDoEstoqueSchema.safeParse({ ...ITEM, disponivel: 9 }).success).toBe(false);
  });

  it("recusa o selo Baixo que contradiz a regra", () => {
    expect(itemDoEstoqueSchema.safeParse({ ...ITEM, baixo: false }).success).toBe(false);
  });
});

describe("historicoDoEstoqueSchema", () => {
  const MOVIMENTO = {
    id: "m1",
    tipo: "venda",
    quantidade: -2,
    motivo: null,
    saldoFisico: 8,
    numeroDoPedido: "#LB482731",
    criadoEm: "2026-11-28T15:00:00.000Z",
  };

  it("aceita movimento com sinal e saldo", () => {
    expect(historicoDoEstoqueSchema.safeParse({ movimentos: [MOVIMENTO] }).success).toBe(true);
  });

  it("recusa movimento zero, tipo desconhecido e saldo negativo", () => {
    for (const ruim of [{ quantidade: 0 }, { tipo: "ajuste" }, { saldoFisico: -1 }]) {
      expect(
        historicoDoEstoqueSchema.safeParse({ movimentos: [{ ...MOVIMENTO, ...ruim }] }).success,
      ).toBe(false);
    }
  });
});
