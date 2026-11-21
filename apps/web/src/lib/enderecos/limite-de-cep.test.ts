import { beforeEach, describe, expect, it, vi } from "vitest";

type Modulo = typeof import("./limite-de-cep");
let dentroDoLimiteDeCep: Modulo["dentroDoLimiteDeCep"];
let visitantesNoLimiteDeCep: Modulo["visitantesNoLimiteDeCep"];

// Módulo novo a cada teste: o mapa de visitantes é estado do módulo e não pode vazar entre testes.
beforeEach(async () => {
  vi.resetModules();
  ({ dentroDoLimiteDeCep, visitantesNoLimiteDeCep } = await import("./limite-de-cep"));
});

describe("dentroDoLimiteDeCep", () => {
  it("aceita 60 consultas por minuto de um visitante e recusa a 61ª, até a janela passar", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 60; i++) expect(dentroDoLimiteDeCep("a", t0 + i)).toBe(true);

    expect(dentroDoLimiteDeCep("a", t0 + 100)).toBe(false);
    expect(dentroDoLimiteDeCep("a", t0 + 60_001)).toBe(true);
  });

  it("esquece o visitante que não volta depois da janela", () => {
    const t0 = 5_000_000;
    dentroDoLimiteDeCep("antigo-1", t0);
    dentroDoLimiteDeCep("antigo-2", t0);
    expect(visitantesNoLimiteDeCep()).toBe(2);

    dentroDoLimiteDeCep("novo", t0 + 120_000);

    expect(visitantesNoLimiteDeCep()).toBe(1);
  });

  it("a varredura roda no máximo uma vez por janela, não a cada consulta", () => {
    const t0 = 9_000_000;
    dentroDoLimiteDeCep("a", t0);
    dentroDoLimiteDeCep("b", t0 + 1_000);
    dentroDoLimiteDeCep("c", t0 + 60_000); // varre: "a" sai, "b" (59 s) fica
    expect(visitantesNoLimiteDeCep()).toBe(2);

    dentroDoLimiteDeCep("d", t0 + 61_500); // "b" já venceu, mas a próxima varredura é só em t0 + 120 s

    expect(visitantesNoLimiteDeCep()).toBe(3);
  });
});
