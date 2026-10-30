import { describe, expect, it } from "vitest";
import { telefoneSchema } from "./telefone.js";

describe("telefoneSchema", () => {
  it.each([
    ["(82) 91234-5678", "82912345678"],
    ["(82) 1234-5678", "8212345678"],
    ["82912345678", "82912345678"],
  ])("aceita %s e guarda só os dígitos", (entrada, esperado) => {
    expect(telefoneSchema.parse(entrada)).toBe(esperado);
  });

  it.each([
    "",
    "(82) 1234",
    "(82) 91234-56789",
    "(02) 91234-5678",
    "(10) 91234-5678",
    "(80) 1234-5678",
  ])("recusa %j com a mensagem do formulário", (entrada) => {
    const result = telefoneSchema.safeParse(entrada);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Informe um telefone com DDD.");
  });
});
