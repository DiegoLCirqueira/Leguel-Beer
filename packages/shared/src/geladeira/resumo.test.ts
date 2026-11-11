import { describe, expect, it } from "vitest";
import { resumirGeladeira } from "./resumo.js";

const linha = (quantidade: number, precoCentavos: number) => ({
  quantidade,
  cerveja: { precoCentavos },
});

describe("resumirGeladeira", () => {
  it("soma as unidades e o subtotal: 2 de R$ 32,00 e 1 de R$ 26,50", () => {
    expect(resumirGeladeira([linha(2, 3200), linha(1, 2650)])).toEqual({
      quantidadeTotal: 3,
      subtotalCentavos: 9050,
    });
  });

  it("devolve zeros para a Geladeira vazia", () => {
    expect(resumirGeladeira([])).toEqual({ quantidadeTotal: 0, subtotalCentavos: 0 });
  });
});
