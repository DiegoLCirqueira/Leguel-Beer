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

const { GET } = await import("./route");

const resposta = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

const sessaoGoTrue = {
  access_token: "acesso-1",
  refresh_token: "renovacao-1",
  user: {
    id: "u1",
    email: "ana@exemplo.com",
    user_metadata: { nome: "Ana Souza", telefone: "82999990000", aceite: true },
  },
};

const pedido = (busca: string) => new Request(`https://leguele.exemplo/auth/confirmar${busca}`);

describe("GET /auth/confirmar", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    gravados.clear();
    redirect.mockClear();
    fetchFalso.mockReset();
    vi.stubEnv("SUPABASE_URL", "http://auth.local");
    vi.stubEnv("SUPABASE_ANON_KEY", "chave-anonima");
    vi.stubEnv("API_URL", "http://api.local");
    vi.stubGlobal("fetch", fetchFalso);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("confirma o e-mail, entra na conta (30 dias), cria o perfil com o nome e o telefone do cadastro e vai à home", async () => {
    fetchFalso.mockImplementation(async (url: string) =>
      url.includes("/auth/v1/verify") ? resposta(200, sessaoGoTrue) : resposta(201, {}),
    );

    await expect(GET(pedido("?token_hash=hash-1&type=signup"))).rejects.toThrow("REDIRECT:/");

    expect(gravados.get("lb_acesso")?.valor).toBe("acesso-1");
    expect(gravados.get("lb_acesso")?.opcoes).toMatchObject({
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
    });
    const chamadaPerfil = fetchFalso.mock.calls.find(([url]) =>
      String(url).endsWith("/me/profile"),
    );
    expect(JSON.parse((chamadaPerfil?.[1] as RequestInit).body as string)).toEqual({
      nome: "Ana Souza",
      telefone: "82999990000",
      aceite: true,
    });
  });

  it("link inválido ou vencido leva à tela de entrar, sem sessão", async () => {
    fetchFalso.mockResolvedValue(resposta(403, {}));

    await expect(GET(pedido("?token_hash=ruim&type=signup"))).rejects.toThrow("REDIRECT:/entrar");
    expect(gravados.size).toBe(0);
  });

  it("sem token ou com tipo desconhecido não chama o Supabase", async () => {
    await expect(GET(pedido("?type=signup"))).rejects.toThrow("REDIRECT:/entrar");
    await expect(GET(pedido("?token_hash=h&type=recovery"))).rejects.toThrow("REDIRECT:/entrar");

    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
