import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dataDeNascimentoSchema } from "./nascimento.js";

describe("dataDeNascimentoSchema", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T15:00:00.000Z"));
  });
  afterEach(() => vi.useRealTimers());

  const erro = (valor: unknown) => {
    const resultado = dataDeNascimentoSchema.safeParse(valor);
    return resultado.success ? null : resultado.error.issues[0]?.message;
  };

  it("aceita DD/MM/AAAA da máscara e entrega AAAA-MM-DD", () => {
    expect(dataDeNascimentoSchema.parse("15/03/1992")).toBe("1992-03-15");
  });

  it("aceita AAAA-MM-DD, o formato que a API devolve", () => {
    expect(dataDeNascimentoSchema.parse("1992-03-15")).toBe("1992-03-15");
  });

  it("aceita 29/02 só em ano bissexto", () => {
    expect(dataDeNascimentoSchema.parse("29/02/2008")).toBe("2008-02-29");
    expect(erro("29/02/2009")).toBe("Informe uma data de nascimento válida.");
  });

  it("recusa data que não existe ou texto fora do formato", () => {
    for (const valor of ["31/04/1990", "00/01/1990", "15/13/1990", "1990", "ontem", ""]) {
      expect(erro(valor)).toBe("Informe uma data de nascimento válida.");
    }
  });

  it("recusa data anterior a 01/01/1900, mas aceita o próprio dia", () => {
    expect(erro("31/12/1899")).toBe("Informe uma data de nascimento válida.");
    expect(dataDeNascimentoSchema.parse("01/01/1900")).toBe("1900-01-01");
  });

  it("recusa data futura pelo dia de Maceió, mas aceita hoje", () => {
    expect(dataDeNascimentoSchema.parse("16/11/2026")).toBe("2026-11-16");
    expect(erro("17/11/2026")).toBe("A data de nascimento não pode ser no futuro.");
  });

  it("aceita menor de 18 anos: o bloqueio é no pedido", () => {
    expect(dataDeNascimentoSchema.parse("16/11/2020")).toBe("2020-11-16");
  });
});
