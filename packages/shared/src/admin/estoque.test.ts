import { describe, expect, it } from "vitest";
import { ajusteDeEstoqueSchema, variacaoDoAjuste } from "./estoque.js";

describe("ajusteDeEstoqueSchema", () => {
  it("a entrada soma e o motivo padrão é 'Produção'", () => {
    const ajuste = ajusteDeEstoqueSchema.parse({ tipo: "entrada", quantidade: 12 });

    expect(ajuste).toEqual({ tipo: "entrada", quantidade: 12, motivo: "Produção" });
    expect(variacaoDoAjuste(ajuste)).toBe(12);
  });

  it("a perda subtrai e exige motivo", () => {
    const ajuste = ajusteDeEstoqueSchema.parse({ tipo: "perda", quantidade: 3, motivo: "Quebra" });

    expect(variacaoDoAjuste(ajuste)).toBe(-3);
    expect(ajusteDeEstoqueSchema.safeParse({ tipo: "perda", quantidade: 3 }).success).toBe(false);
    expect(
      ajusteDeEstoqueSchema.safeParse({ tipo: "perda", quantidade: 3, motivo: "  " }).success,
    ).toBe(false);
  });

  it("a correção soma ou subtrai, não aceita zero e exige motivo", () => {
    const mais = ajusteDeEstoqueSchema.parse({
      tipo: "correcao",
      quantidade: 2,
      motivo: "Contagem",
    });
    const menos = ajusteDeEstoqueSchema.parse({
      tipo: "correcao",
      quantidade: -2,
      motivo: "Contagem",
    });

    expect(variacaoDoAjuste(mais)).toBe(2);
    expect(variacaoDoAjuste(menos)).toBe(-2);
    expect(
      ajusteDeEstoqueSchema.safeParse({ tipo: "correcao", quantidade: 0, motivo: "x" }).success,
    ).toBe(false);
    expect(ajusteDeEstoqueSchema.safeParse({ tipo: "correcao", quantidade: 2 }).success).toBe(
      false,
    );
  });

  it("entrada e perda não aceitam quantidade zero, negativa ou fracionada", () => {
    for (const tipo of ["entrada", "perda"]) {
      for (const quantidade of [0, -1, 1.5]) {
        expect(ajusteDeEstoqueSchema.safeParse({ tipo, quantidade, motivo: "x" }).success).toBe(
          false,
        );
      }
    }
  });

  it("o motivo tem até 80 caracteres e tipo desconhecido é recusado", () => {
    expect(
      ajusteDeEstoqueSchema.safeParse({ tipo: "perda", quantidade: 1, motivo: "a".repeat(81) })
        .success,
    ).toBe(false);
    expect(ajusteDeEstoqueSchema.safeParse({ tipo: "venda", quantidade: 1 }).success).toBe(false);
  });

  it("a quantidade vai até 100.000 (em módulo); acima falha", () => {
    expect(ajusteDeEstoqueSchema.safeParse({ tipo: "entrada", quantidade: 100_000 }).success).toBe(
      true,
    );
    expect(ajusteDeEstoqueSchema.safeParse({ tipo: "entrada", quantidade: 100_001 }).success).toBe(
      false,
    );
    expect(
      ajusteDeEstoqueSchema.safeParse({ tipo: "perda", quantidade: 100_001, motivo: "x" }).success,
    ).toBe(false);
    for (const quantidade of [100_000, -100_000]) {
      expect(
        ajusteDeEstoqueSchema.safeParse({ tipo: "correcao", quantidade, motivo: "x" }).success,
      ).toBe(true);
    }
    for (const quantidade of [100_001, -100_001]) {
      expect(
        ajusteDeEstoqueSchema.safeParse({ tipo: "correcao", quantidade, motivo: "x" }).success,
      ).toBe(false);
    }
  });

  it("campo a mais no ajuste é recusado", () => {
    expect(
      ajusteDeEstoqueSchema.safeParse({ tipo: "entrada", quantidade: 1, cervejaId: "x" }).success,
    ).toBe(false);
  });
});
