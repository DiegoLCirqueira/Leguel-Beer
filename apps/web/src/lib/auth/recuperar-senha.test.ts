import { describe, expect, it, vi } from "vitest";
import type { Sessao } from "./gotrue";
import { definirNovaSenha, pedirRecuperacao } from "./recuperar-senha";

const redirectTo = "http://localhost:3000/nova-senha";

describe("pedirRecuperacao", () => {
  it("pede o link com o e-mail em minúsculas e mostra o aviso de envio", async () => {
    const auth = { recover: vi.fn().mockResolvedValue("enviado") };

    const resultado = await pedirRecuperacao({ email: "Ana@Exemplo.com" }, { auth, redirectTo });

    expect(resultado).toEqual({ tipo: "enviado" });
    expect(auth.recover).toHaveBeenCalledWith("ana@exemplo.com", redirectTo);
  });

  it("o limite de pedidos mostra o mesmo aviso, sem revelar nada", async () => {
    const auth = { recover: vi.fn().mockResolvedValue("limite") };

    expect(await pedirRecuperacao({ email: "ana@exemplo.com" }, { auth, redirectTo })).toEqual({
      tipo: "enviado",
    });
  });

  it("e-mail inválido aponta o campo e não chama o Supabase", async () => {
    const auth = { recover: vi.fn() };

    expect(await pedirRecuperacao({ email: "ana@" }, { auth, redirectTo })).toEqual({
      tipo: "invalido",
      erros: { email: "Informe um e-mail válido." },
    });
    expect(auth.recover).not.toHaveBeenCalled();
  });

  it("falha do serviço vira erro", async () => {
    const auth = { recover: vi.fn().mockResolvedValue("erro") };

    expect(await pedirRecuperacao({ email: "ana@exemplo.com" }, { auth, redirectTo })).toEqual({
      tipo: "erro",
    });
  });
});

const sessao: Sessao = {
  accessToken: "acesso-novo",
  refreshToken: "renovacao-nova",
  user: { id: "u1", email: "ana@exemplo.com", metadata: {} },
};

const entrada = {
  tokenHash: "hash-1",
  type: "recovery",
  senha: "nova-senha-123",
  confirmacao: "nova-senha-123",
};

const dependencias = (extra: Record<string, unknown> = {}) => ({
  auth: {
    verify: vi.fn().mockResolvedValue(sessao),
    updatePassword: vi.fn().mockResolvedValue(true),
    signOutOthers: vi.fn().mockResolvedValue(true),
    ...extra,
  },
});

describe("definirNovaSenha", () => {
  it("troca a senha, encerra as outras sessões e devolve a sessão nova", async () => {
    const deps = dependencias();

    const resultado = await definirNovaSenha(entrada, deps);

    expect(resultado).toEqual({ tipo: "ok", sessao });
    expect(deps.auth.verify).toHaveBeenCalledWith({ tokenHash: "hash-1", type: "recovery" });
    expect(deps.auth.updatePassword).toHaveBeenCalledWith("acesso-novo", "nova-senha-123");
    expect(deps.auth.signOutOthers).toHaveBeenCalledWith("acesso-novo");
  });

  it("senha inválida aponta as mensagens e não gasta o link", async () => {
    const deps = dependencias();

    expect(
      await definirNovaSenha({ ...entrada, senha: "abc123", confirmacao: "abc123" }, deps),
    ).toEqual({
      tipo: "invalido",
      erros: { senha: "A senha precisa ter pelo menos 8 caracteres." },
    });
    expect(await definirNovaSenha({ ...entrada, confirmacao: "outra-senha-123" }, deps)).toEqual({
      tipo: "invalido",
      erros: { confirmacao: "As senhas não conferem." },
    });
    expect(deps.auth.verify).not.toHaveBeenCalled();
  });

  it.each([
    ["sem token", { tokenHash: "" }],
    ["com tipo diferente de recovery", { type: "signup" }],
  ])("link %s é link inválido, sem chamar o Supabase", async (_, extra) => {
    const deps = dependencias();

    expect(await definirNovaSenha({ ...entrada, ...extra }, deps)).toEqual({
      tipo: "link-invalido",
    });
    expect(deps.auth.verify).not.toHaveBeenCalled();
  });

  it("link vencido, já usado ou substituído (verify recusa) é link inválido e não troca a senha", async () => {
    const deps = dependencias({ verify: vi.fn().mockResolvedValue(null) });

    expect(await definirNovaSenha(entrada, deps)).toEqual({ tipo: "link-invalido" });
    expect(deps.auth.updatePassword).not.toHaveBeenCalled();
  });

  it("senha recusada pelo Supabase vira erro, sem encerrar as outras sessões", async () => {
    const deps = dependencias({ updatePassword: vi.fn().mockResolvedValue(false) });

    expect(await definirNovaSenha(entrada, deps)).toEqual({ tipo: "erro" });
    expect(deps.auth.signOutOthers).not.toHaveBeenCalled();
  });
});
