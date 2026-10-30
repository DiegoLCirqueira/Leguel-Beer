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

const { entrarAction, reenviarAction } = await import("./actions");

const sessaoGoTrue = {
  access_token: "acesso-1",
  refresh_token: "renovacao-1",
  user: {
    id: "u1",
    email: "ana@exemplo.com",
    user_metadata: { nome: "Ana Souza", telefone: "82999990000", aceite: true },
  },
};

const resposta = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

const valido = { email: "ana@exemplo.com", senha: "qualquer", manterConectado: true };

describe("entrarAction", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    gravados.clear();
    redirect.mockClear();
    fetchFalso.mockReset();
    vi.stubEnv("SUPABASE_URL", "http://auth.local");
    vi.stubEnv("SUPABASE_ANON_KEY", "chave-anonima");
    vi.stubEnv("API_URL", "http://api.local");
    vi.stubEnv("SITE_URL", "https://leguele.exemplo");
    vi.stubGlobal("fetch", fetchFalso);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  function simularLoginOk() {
    fetchFalso.mockImplementation(async (url: string) =>
      url.includes("/auth/v1/token") ? resposta(200, sessaoGoTrue) : resposta(201, {}),
    );
  }

  it("entra, grava os três cookies de sessão com 30 dias, cria o perfil e vai para a página de onde veio", async () => {
    simularLoginOk();

    await expect(entrarAction("/conta?aba=pedidos", valido)).rejects.toThrow(
      "REDIRECT:/conta?aba=pedidos",
    );

    expect(gravados.get("lb_acesso")?.valor).toBe("acesso-1");
    expect(gravados.get("lb_renovacao")?.valor).toBe("renovacao-1");
    expect(gravados.get("lb_manter")?.valor).toBe("1");
    for (const nome of ["lb_acesso", "lb_renovacao", "lb_manter"]) {
      expect(gravados.get(nome)?.opcoes).toMatchObject({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
    const chamadaPerfil = fetchFalso.mock.calls.find(([url]) =>
      String(url).endsWith("/me/profile"),
    );
    expect(chamadaPerfil?.[1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer acesso-1" }),
    });
  });

  it("com Manter-me conectado desmarcado os cookies não têm validade", async () => {
    simularLoginOk();

    await expect(entrarAction(undefined, { ...valido, manterConectado: false })).rejects.toThrow(
      "REDIRECT:/",
    );

    expect(gravados.get("lb_acesso")?.opcoes).not.toHaveProperty("maxAge");
    expect(gravados.get("lb_manter")?.valor).toBe("0");
  });

  it("endereço de retorno de outro site é ignorado: vai para a home", async () => {
    simularLoginOk();

    await expect(entrarAction("https://exemplo.com/roubo", valido)).rejects.toThrow("REDIRECT:/");
  });

  it("a API fora do ar não impede a entrada", async () => {
    fetchFalso.mockImplementation(async (url: string) => {
      if (url.includes("/auth/v1/token")) return resposta(200, sessaoGoTrue);
      throw new TypeError("API fora do ar");
    });

    await expect(entrarAction(undefined, valido)).rejects.toThrow("REDIRECT:/");
    expect(gravados.has("lb_acesso")).toBe(true);
  });

  it("senha errada devolve o aviso, sem cookies nem redirecionamento", async () => {
    fetchFalso.mockResolvedValue(resposta(400, { error_code: "invalid_credentials" }));

    expect(await entrarAction(undefined, valido)).toEqual({ tipo: "credenciais" });
    expect(gravados.size).toBe(0);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("dados inválidos não chegam ao Supabase", async () => {
    const resultado = await entrarAction(undefined, { ...valido, email: "ana@" });

    expect(resultado).toMatchObject({ tipo: "invalido" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("sem a configuração do Supabase devolve erro", async () => {
    vi.stubEnv("SUPABASE_URL", "");

    expect(await entrarAction(undefined, valido)).toEqual({ tipo: "erro" });
  });
});

describe("reenviarAction", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "http://auth.local");
    vi.stubEnv("SUPABASE_ANON_KEY", "chave-anonima");
    vi.stubEnv("SITE_URL", "https://leguele.exemplo");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reenvia o link de confirmação com o endereço do site", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, {}));
    vi.stubGlobal("fetch", fetchFalso);

    expect(await reenviarAction("ana@exemplo.com")).toBe("enviado");
    const corpo = JSON.parse((fetchFalso.mock.calls[0]?.[1] as RequestInit).body as string);
    expect(corpo.options.email_redirect_to).toBe("https://leguele.exemplo/auth/confirmar");
  });
});
