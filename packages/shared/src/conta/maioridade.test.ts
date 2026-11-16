import { describe, expect, it } from "vitest";
import { hojeEmMaceio, temMaioridade } from "./maioridade.js";

describe("hojeEmMaceio", () => {
  it("usa o dia de Maceió (UTC-3): 23h30 em Maceió já é o dia seguinte em UTC", () => {
    expect(hojeEmMaceio(new Date("2026-03-02T02:30:00.000Z"))).toBe("2026-03-01");
    expect(hojeEmMaceio(new Date("2026-03-02T03:00:00.000Z"))).toBe("2026-03-02");
  });
});

describe("temMaioridade", () => {
  const meiaNoiteEmMaceio = (dia: string) => new Date(`${dia}T03:00:00.000Z`);

  it.each([
    ["véspera dos 18 anos", "2008-03-15", "2026-03-14", false],
    ["no dia dos 18 anos", "2008-03-15", "2026-03-15", true],
    ["dia seguinte aos 18 anos", "2008-03-15", "2026-03-16", true],
    ["nascido em 29/02 (2008), em 28/02/2026", "2008-02-29", "2026-02-28", false],
    ["nascido em 29/02 (2008), em 01/03/2026", "2008-02-29", "2026-03-01", true],
  ])("%s", (_nome, nascimento, hoje, esperado) => {
    expect(temMaioridade(nascimento, meiaNoiteEmMaceio(hoje))).toBe(esperado);
  });

  it("vale o dia de Maceió, não o de UTC: às 23h30 de Maceió do dia dos 18 anos ainda não é o dia seguinte", () => {
    // 2026-03-16T02:30Z é 15/03 23h30 em Maceió: quem faz 18 em 16/03 ainda não pode comprar.
    expect(temMaioridade("2008-03-16", new Date("2026-03-16T02:30:00.000Z"))).toBe(false);
    expect(temMaioridade("2008-03-15", new Date("2026-03-16T02:30:00.000Z"))).toBe(true);
  });
});
