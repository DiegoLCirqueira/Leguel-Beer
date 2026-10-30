import { describe, expect, it } from "vitest";
import { entrarSchema, recuperarSenhaSchema } from "./entrar.js";

describe("entrarSchema", () => {
  it("aceita e-mail e senha, com 'manter conectado' desligado por padrão", () => {
    expect(entrarSchema.parse({ email: " Ana@Exemplo.com", senha: "qualquer" })).toEqual({
      email: "ana@exemplo.com",
      senha: "qualquer",
      manterConectado: false,
    });
  });

  it("não impõe o mínimo de 8 caracteres ao entrar, só exige a senha", () => {
    expect(entrarSchema.safeParse({ email: "ana@exemplo.com", senha: "abc" }).success).toBe(true);
    const vazia = entrarSchema.safeParse({ email: "ana@exemplo.com", senha: "" });
    expect(vazia.error?.issues[0]?.message).toBe("Informe sua senha.");
  });

  it("recusa e-mail inválido", () => {
    const result = entrarSchema.safeParse({ email: "ana@", senha: "x" });
    expect(result.error?.issues[0]?.message).toBe("Informe um e-mail válido.");
  });
});

describe("recuperarSenhaSchema", () => {
  it("pede só o e-mail", () => {
    expect(recuperarSenhaSchema.parse({ email: "Ana@Exemplo.com" })).toEqual({
      email: "ana@exemplo.com",
    });
    expect(recuperarSenhaSchema.safeParse({ email: "" }).success).toBe(false);
  });
});
