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

describe("cepSchema (formato)", () => {
  it.each(["", "5703", "57035-00", "570350000", "abcdefgh"])(
    "recusa %j com a mensagem do campo",
    (entrada) => {
      const result = cepSchema.safeParse(entrada);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("Informe o CEP.");
    },
  );
});

describe("cepSchema (faixa de Alagoas)", () => {
  it.each(["01432-000", "56999-999", "58000-000", "01432000"])(
    "recusa o CEP %s, fora da faixa 57, com a mensagem de Alagoas",
    (entrada) => {
      const result = cepSchema.safeParse(entrada);

      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.message).toBe("Por enquanto só entregamos em Alagoas.");
    },
  );
});
