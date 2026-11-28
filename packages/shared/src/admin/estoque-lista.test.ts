import { describe, expect, it } from "vitest";
import {
  consultaDoHistoricoSchema,
  estoqueBaixoNoAdmin,
  historicoDoEstoqueSchema,
  itemDoEstoqueSchema,
  listaDoEstoqueSchema,
  movimentoDeEstoqueSchema,
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

describe("itemDoEstoqueSchema: tetos e rigor", () => {
  const ITEM = {
    cervejaId: "1",
    nome: "Maré Alta",
    fisico: 10,
    reservado: 4,
    disponivel: 6,
    minimo: 6,
    baixo: true,
  };

  it("o disponível não é negativo: o físico nunca fica abaixo do reservado", () => {
    expect(
      itemDoEstoqueSchema.safeParse({ ...ITEM, fisico: 3, reservado: 4, disponivel: -1 }).success,
    ).toBe(false);
  });

  it("os inteiros vão até o Int de 32 bits do banco; acima falha", () => {
    const max = 2_147_483_647;
    expect(
      itemDoEstoqueSchema.safeParse({
        ...ITEM,
        fisico: max,
        reservado: 0,
        disponivel: max,
        baixo: false,
      }).success,
    ).toBe(true);
    expect(
      itemDoEstoqueSchema.safeParse({
        ...ITEM,
        fisico: max + 1,
        reservado: 0,
        disponivel: max + 1,
        baixo: false,
      }).success,
    ).toBe(false);
  });

  it("campo a mais é recusado", () => {
    expect(itemDoEstoqueSchema.safeParse({ ...ITEM, custo: 1 }).success).toBe(false);
    expect(listaDoEstoqueSchema.safeParse({ itens: [], extra: 1 }).success).toBe(false);
  });
});

describe("movimentoDeEstoqueSchema: tipo, sinal, motivo e pedido", () => {
  const BASE = { id: "m1", saldoFisico: 8, criadoEm: "2026-11-28T15:00:00.000Z" };
  const entrada = {
    ...BASE,
    tipo: "entrada",
    quantidade: 5,
    motivo: "Produção",
    numeroDoPedido: null,
  };
  const perda = { ...BASE, tipo: "perda", quantidade: -2, motivo: "Quebra", numeroDoPedido: null };
  const correcao = {
    ...BASE,
    tipo: "correcao",
    quantidade: -1,
    motivo: "Contagem",
    numeroDoPedido: null,
  };
  const venda = {
    ...BASE,
    tipo: "venda",
    quantidade: -2,
    motivo: null,
    numeroDoPedido: "#LB482731",
  };
  const cancelamento = {
    ...BASE,
    tipo: "cancelamento",
    quantidade: 2,
    motivo: null,
    numeroDoPedido: "#LB482731",
  };
  const ok = (m: object) => movimentoDeEstoqueSchema.safeParse(m).success;

  it("aceita um movimento coerente de cada tipo (correção com os dois sinais)", () => {
    for (const m of [
      entrada,
      perda,
      correcao,
      { ...correcao, quantidade: 3 },
      venda,
      cancelamento,
    ]) {
      expect(ok(m)).toBe(true);
    }
  });

  it.each([
    ["entrada negativa", { ...entrada, quantidade: -5 }],
    ["entrada sem motivo", { ...entrada, motivo: null }],
    ["entrada com pedido", { ...entrada, numeroDoPedido: "#LB482731" }],
    ["perda positiva", { ...perda, quantidade: 2 }],
    ["perda sem motivo", { ...perda, motivo: null }],
    ["perda com pedido", { ...perda, numeroDoPedido: "#LB482731" }],
    ["correção zero", { ...correcao, quantidade: 0 }],
    ["correção sem motivo", { ...correcao, motivo: null }],
    ["venda positiva", { ...venda, quantidade: 2 }],
    ["venda sem número do pedido", { ...venda, numeroDoPedido: null }],
    ["venda com motivo", { ...venda, motivo: "x" }],
    ["cancelamento negativo", { ...cancelamento, quantidade: -2 }],
    ["cancelamento sem número do pedido", { ...cancelamento, numeroDoPedido: null }],
    ["tipo desconhecido", { ...entrada, tipo: "ajuste" }],
    ["saldo negativo", { ...entrada, saldoFisico: -1 }],
    ["saldo acima do Int de 32 bits", { ...entrada, saldoFisico: 2_147_483_648 }],
    ["quantidade acima do teto", { ...entrada, quantidade: 100_001 }],
    ["número de pedido fora do formato", { ...venda, numeroDoPedido: "482731" }],
    ["campo a mais", { ...entrada, custo: 1 }],
  ])("recusa %s", (_nome, movimento) => {
    expect(ok(movimento)).toBe(false);
  });

  it("o histórico traz a lista de movimentos coerentes", () => {
    expect(
      historicoDoEstoqueSchema.safeParse({ movimentos: [entrada, venda], proximoCursor: null })
        .success,
    ).toBe(true);
    expect(
      historicoDoEstoqueSchema.safeParse({
        movimentos: [{ ...venda, numeroDoPedido: null }],
        proximoCursor: null,
      }).success,
    ).toBe(false);
  });
});

describe("histórico paginado", () => {
  it("a página traz o cursor da próxima, ou nulo na última, e recusa o histórico sem ele", () => {
    expect(
      historicoDoEstoqueSchema.safeParse({ movimentos: [], proximoCursor: "abc" }).success,
    ).toBe(true);
    expect(historicoDoEstoqueSchema.safeParse({ movimentos: [] }).success).toBe(false);
    expect(historicoDoEstoqueSchema.safeParse({ movimentos: [], proximoCursor: "" }).success).toBe(
      false,
    );
  });

  it("a consulta usa 20 por página por padrão, aceita de 1 a 50 e limita o cursor a 200 caracteres", () => {
    expect(consultaDoHistoricoSchema.parse({}).limite).toBe(20);
    expect(consultaDoHistoricoSchema.parse({ limite: "50" }).limite).toBe(50);
    for (const ruim of [
      { limite: 0 },
      { limite: 51 },
      { cursor: "a".repeat(201) },
      { cursor: "" },
      { x: 1 },
    ]) {
      expect(consultaDoHistoricoSchema.safeParse(ruim).success).toBe(false);
    }
  });
});
