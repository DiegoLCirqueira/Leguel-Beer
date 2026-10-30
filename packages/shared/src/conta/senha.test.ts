import { describe, expect, it } from "vitest";
import { senhaSchema } from "./senha.js";

describe("senhaSchema", () => {
  it("aceita de 8 a 72 caracteres, sem exigir tipos de caractere", () => {
    expect(senhaSchema.parse("abcdefgh")).toBe("abcdefgh");
    expect(senhaSchema.parse("a".repeat(72))).toHaveLength(72);
  });

  it.each(["", "abc123"])("recusa %j por ser curta", (entrada) => {
    const result = senhaSchema.safeParse(entrada);

    expect(result.error?.issues[0]?.message).toBe("A senha precisa ter pelo menos 8 caracteres.");
  });

  it("recusa mais de 72 caracteres", () => {
    const result = senhaSchema.safeParse("a".repeat(73));

    expect(result.error?.issues[0]?.message).toBe("A senha pode ter no máximo 72 caracteres.");
  });
});
