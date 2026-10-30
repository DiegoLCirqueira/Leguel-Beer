import { describe, expect, it } from "vitest";
import { mascararTelefone } from "./mascara-telefone";

describe("mascararTelefone", () => {
  it.each([
    ["", ""],
    ["8", "(8"],
    ["82", "(82"],
    ["829", "(82) 9"],
    ["8299999", "(82) 9999-9"],
    ["8212345678", "(82) 1234-5678"],
    ["82999990000", "(82) 99999-0000"],
    ["(82) 99999-0000", "(82) 99999-0000"],
    ["829999900001234", "(82) 99999-0000"],
    ["abc82", "(82"],
  ])("%j vira %j", (entrada, esperado) => {
    expect(mascararTelefone(entrada)).toBe(esperado);
  });
});
