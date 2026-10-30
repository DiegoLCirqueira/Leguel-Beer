import { describe, expect, it, vi } from "vitest";
import type { Sessao } from "./gotrue";
import { entrar } from "./entrar";

const sessao: Sessao = {
  accessToken: "acesso",
  refreshToken: "renovacao",
  user: { id: "u1", email: "ana@exemplo.com", metadata: {} },
};

const valido = { email: "Ana@Exemplo.com", senha: "qualquer", manterConectado: true };

describe("entrar", () => {
  it("entra com o e-mail em minúsculas e devolve a sessão e a escolha de Manter-me conectado", async () => {
    const auth = { signInPassword: vi.fn().mockResolvedValue({ tipo: "ok", sessao }) };

    const resultado = await entrar(valido, { auth });

    expect(resultado).toEqual({ tipo: "ok", sessao, manterConectado: true });
    expect(auth.signInPassword).toHaveBeenCalledWith("ana@exemplo.com", "qualquer");
  });

  it("aponta e-mail inválido e senha vazia sem chamar o Supabase", async () => {
    const auth = { signInPassword: vi.fn() };

    const resultado = await entrar({ email: "ana@", senha: "", manterConectado: false }, { auth });

    expect(resultado).toEqual({
      tipo: "invalido",
      erros: { email: "Informe um e-mail válido.", senha: "Informe sua senha." },
    });
    expect(auth.signInPassword).not.toHaveBeenCalled();
  });

  it("conta ou senha errada são a mesma resposta, sem revelar qual dado está errado", async () => {
    const auth = { signInPassword: vi.fn().mockResolvedValue({ tipo: "credenciais" }) };

    expect(await entrar(valido, { auth })).toEqual({ tipo: "credenciais" });
  });

  it("conta não confirmada leva o e-mail para oferecer o reenvio do link", async () => {
    const auth = { signInPassword: vi.fn().mockResolvedValue({ tipo: "nao-confirmado" }) };

    expect(await entrar(valido, { auth })).toEqual({
      tipo: "nao-confirmado",
      email: "ana@exemplo.com",
    });
  });

  it("repassa o erro inesperado", async () => {
    const auth = { signInPassword: vi.fn().mockResolvedValue({ tipo: "erro" }) };

    expect(await entrar(valido, { auth })).toEqual({ tipo: "erro" });
  });
});
