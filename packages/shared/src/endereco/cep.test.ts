import { describe, expect, it } from "vitest";
import { cepSchema } from "./cep.js";

describe("cepSchema", () => {
  it.each([
    ["57035-000", "57035000"],
    ["57035000", "57035000"],
    ["57000-000", "57000000"],
    ["57999-999", "57999999"],
  ])("aceita o CEP de Alagoas %s e guarda só os dígitos", (entrada, esperado) => {
    expect(cepSchema.parse(entrada)).toBe(esperado);
  });
});
