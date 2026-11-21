import { describe, expect, it } from "vitest";
import { dentroDoLimiteDeCep, visitantesNoLimiteDeCep } from "./limite-de-cep";

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
    const antes = visitantesNoLimiteDeCep();

    dentroDoLimiteDeCep("novo", t0 + 120_000);

    expect(visitantesNoLimiteDeCep()).toBe(antes - 2 + 1);
  });
});
