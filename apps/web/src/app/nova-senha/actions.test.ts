import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const gravados = new Map<string, { valor: string; opcoes: Record<string, unknown> }>();
const redirect = vi.fn((destino: string) => {
  throw new Error(`REDIRECT:${destino}`);
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    set: (nome: string, valor: string, opcoes: Record<string, unknown>) =>
      gravados.set(nome, { valor, opcoes }),
  }),
}));
vi.mock("next/navigation", () => ({ redirect }));

const { novaSenhaAction } = await import("./actions");

const resposta = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

const sessaoGoTrue = {
  access_token: "acesso-novo",
  refresh_token: "renovacao-nova",
  user: { id: "u1", email: "ana@exemplo.com", user_metadata: {} },
};

const dados = { senha: "nova-senha-123", confirmacao: "nova-senha-123" };

describe("novaSenhaAction", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    gravados.clear();
    redirect.mockClear();
    fetchFalso.mockReset();
    vi.stubEnv("SUPABASE_URL", "http://auth.local");
    vi.stubEnv("SUPABASE_ANON_KEY", "chave-anonima");
    vi.stubGlobal("fetch", fetchFalso);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function simularTudoOk() {
    fetchFalso.mockImplementation(async (url: string) =>
      url.includes("/auth/v1/verify") ? resposta(200, sessaoGoTrue) : resposta(200, {}),
    );
  }

  it("confirma o link, troca a senha, encerra as outras sessões, entra (30 dias) e vai à home com o aviso", async () => {
    simularTudoOk();

    await expect(novaSenhaAction("hash-1", "recovery", dados)).rejects.toThrow(
      "REDIRECT:/?aviso=senha-alterada",
    );

    const urls = fetchFalso.mock.calls.map(([url]) => String(url));
    expect(urls).toEqual([
      "http://auth.local/auth/v1/verify",
      "http://auth.local/auth/v1/user",
      "http://auth.local/auth/v1/logout?scope=others",
    ]);
    expect(gravados.get("lb_acesso")?.valor).toBe("acesso-novo");
    expect(gravados.get("lb_acesso")?.opcoes).toMatchObject({
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    });
  });

  it("link que não vale mais devolve link-invalido, sem sessão", async () => {
    fetchFalso.mockResolvedValue(resposta(403, {}));

    expect(await novaSenhaAction("hash-ruim", "recovery", dados)).toEqual({
      tipo: "link-invalido",
    });
    expect(gravados.size).toBe(0);
  });

  it("senha inválida devolve as mensagens e não toca no Supabase", async () => {
    expect(
      await novaSenhaAction("hash-1", "recovery", { senha: "abc123", confirmacao: "abc123" }),
    ).toEqual({
      tipo: "invalido",
      erros: { senha: "A senha precisa ter pelo menos 8 caracteres." },
    });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("sem a configuração do Supabase devolve erro", async () => {
    vi.stubEnv("SUPABASE_URL", "");

    expect(await novaSenhaAction("hash-1", "recovery", dados)).toEqual({ tipo: "erro" });
  });

  it("senha recusada depois de verificar o link devolve senha-nao-salva e não entra", async () => {
    fetchFalso.mockImplementation(async (url: string) =>
      url.includes("/auth/v1/verify") ? resposta(200, sessaoGoTrue) : resposta(422, {}),
    );

    expect(await novaSenhaAction("hash-1", "recovery", dados)).toEqual({ tipo: "senha-nao-salva" });
    expect(gravados.size).toBe(0);
  });
});
