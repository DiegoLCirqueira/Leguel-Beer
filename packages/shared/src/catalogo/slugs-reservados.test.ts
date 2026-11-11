import { describe, expect, it } from "vitest";
import { SLUGS_RESERVADOS, slugReservado } from "./slugs-reservados.js";

describe("slugs reservados do catálogo", () => {
  it("destaques é reservado: a rota fixa GET /catalogo/destaques vem antes da parametrizada", () => {
    expect(SLUGS_RESERVADOS).toContain("destaques");
    expect(slugReservado("destaques")).toBe(true);
  });

  it("qualquer outro slug não é reservado, e a comparação é exata", () => {
    expect(slugReservado("mare-alta")).toBe(false);
    expect(slugReservado("Destaques")).toBe(false);
    expect(slugReservado("destaques-2")).toBe(false);
    expect(slugReservado("")).toBe(false);
  });
});
