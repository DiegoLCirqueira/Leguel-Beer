import { describe, expect, it } from "vitest";
import { nomeCompletoSchema } from "./nome.js";

describe("nomeCompletoSchema", () => {
  it("aceita o nome e remove espaços nas pontas", () => {
    expect(nomeCompletoSchema.parse("  Ana Souza ")).toBe("Ana Souza");
  });

  it.each(["", "   "])("recusa o nome vazio %j", (entrada) => {
    const result = nomeCompletoSchema.safeParse(entrada);

    expect(result.error?.issues[0]?.message).toBe("Informe seu nome completo.");
  });

  it("recusa mais de 120 caracteres", () => {
    const result = nomeCompletoSchema.safeParse("a".repeat(121));

    expect(result.error?.issues[0]?.message).toBe("O nome pode ter até 120 caracteres.");
  });
});
