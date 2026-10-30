import { describe, expect, it, vi } from "vitest";
import { criarConta } from "./criar-conta";

const valido = {
  nome: "Ana Souza",
  email: "Ana@Exemplo.com",
  telefone: "(82) 99999-0000",
  senha: "senha-segura",
  confirmacao: "senha-segura",
  aceite: true,
};

const redirectTo = "http://localhost:3000/auth/confirmar";

describe("criarConta", () => {
  it("cadastra com e-mail em minúsculas e telefone só com dígitos e avisa que o link foi enviado", async () => {
    const auth = { signUp: vi.fn().mockResolvedValue({ tipo: "enviado" }) };

    const resultado = await criarConta(valido, { auth, redirectTo });

    expect(resultado).toEqual({ tipo: "enviado", email: "ana@exemplo.com" });
    expect(auth.signUp).toHaveBeenCalledWith({
      email: "ana@exemplo.com",
      senha: "senha-segura",
      metadata: { nome: "Ana Souza", telefone: "82999990000", aceite: true },
      redirectTo,
    });
  });

  it("devolve a mensagem de cada campo inválido sem chamar o Supabase", async () => {
    const auth = { signUp: vi.fn() };

    const resultado = await criarConta(
      {
        nome: "",
        email: "ana@",
        telefone: "(82) 1234",
        senha: "abc123",
        confirmacao: "outra",
        aceite: false,
      },
      { auth, redirectTo },
    );

    expect(resultado).toEqual({
      tipo: "invalido",
      erros: {
        nome: "Informe seu nome completo.",
        email: "Informe um e-mail válido.",
        telefone: "Informe um telefone com DDD.",
        senha: "A senha precisa ter pelo menos 8 caracteres.",
        aceite: "Aceite os termos para criar sua conta.",
      },
    });
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("aponta a confirmação diferente da senha", async () => {
    const auth = { signUp: vi.fn() };

    const resultado = await criarConta(
      { ...valido, confirmacao: "diferente" },
      { auth, redirectTo },
    );

    expect(resultado).toEqual({
      tipo: "invalido",
      erros: { confirmacao: "As senhas não conferem." },
    });
  });

  it("repassa o e-mail que já tem conta, com o e-mail normalizado", async () => {
    const auth = { signUp: vi.fn().mockResolvedValue({ tipo: "email-ja-cadastrado" }) };

    expect(await criarConta(valido, { auth, redirectTo })).toEqual({
      tipo: "email-ja-cadastrado",
      email: "ana@exemplo.com",
    });
  });

  it("repassa o erro inesperado", async () => {
    const auth = { signUp: vi.fn().mockResolvedValue({ tipo: "erro" }) };

    expect(await criarConta(valido, { auth, redirectTo })).toEqual({ tipo: "erro" });
  });
});
