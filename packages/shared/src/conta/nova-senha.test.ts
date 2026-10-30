import { describe, expect, it } from "vitest";
import { novaSenhaSchema } from "./nova-senha.js";

describe("novaSenhaSchema", () => {
  it("aceita a senha nova confirmada", () => {
    expect(novaSenhaSchema.parse({ senha: "senha-nova-1", confirmacao: "senha-nova-1" })).toEqual({
      senha: "senha-nova-1",
      confirmacao: "senha-nova-1",
    });
  });

  it.each([
    [{ senha: "abc123", confirmacao: "abc123" }, "senha", "A senha precisa ter pelo menos 8 caracteres."],
    [{ senha: "senha-nova-1", confirmacao: "outra-1234" }, "confirmacao", "As senhas não conferem."],
  ])("recusa %j", (dados, campo, mensagem) => {
    const issue = novaSenhaSchema.safeParse(dados).error?.issues[0];

    expect({ campo: issue?.path.join("."), mensagem: issue?.message }).toEqual({ campo, mensagem });
  });
});
