import { describe, expect, it } from "vitest";
import { cadastroFormSchema } from "./cadastro.js";

const valido = {
  nome: "Ana Souza",
  email: "Ana@Exemplo.com",
  telefone: "(82) 91234-5678",
  senha: "senha-forte-1",
  confirmacao: "senha-forte-1",
  aceite: true,
};

function primeiroErro(alteracao: Partial<Record<keyof typeof valido, unknown>>) {
  const result = cadastroFormSchema.safeParse({ ...valido, ...alteracao });
  return result.error?.issues[0] && {
    campo: result.error.issues[0].path.join("."),
    mensagem: result.error.issues[0].message,
  };
}

describe("cadastroFormSchema", () => {
  it("aceita o cadastro válido e entrega e-mail e telefone normalizados", () => {
    expect(cadastroFormSchema.parse(valido)).toMatchObject({
      email: "ana@exemplo.com",
      telefone: "82912345678",
    });
  });

  it.each([
    [{ nome: "" }, "nome", "Informe seu nome completo."],
    [{ email: "ana@" }, "email", "Informe um e-mail válido."],
    [{ telefone: "(82) 1234" }, "telefone", "Informe um telefone com DDD."],
    [{ senha: "abc123", confirmacao: "abc123" }, "senha", "A senha precisa ter pelo menos 8 caracteres."],
    [{ confirmacao: "outra-senha-1" }, "confirmacao", "As senhas não conferem."],
    [{ aceite: false }, "aceite", "Aceite os termos para criar sua conta."],
  ])("recusa %j no campo %s", (alteracao, campo, mensagem) => {
    expect(primeiroErro(alteracao)).toEqual({ campo, mensagem });
  });
});
