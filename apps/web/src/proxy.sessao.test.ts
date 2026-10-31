// @vitest-environment node
import { getRedirectUrl, getRewrittenUrl, isRewrite } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

const agora = Date.now();
const jwt = (expEmSegundos: number) =>
  `cab.${Buffer.from(JSON.stringify({ exp: Math.floor(agora / 1000) + expEmSegundos })).toString("base64url")}.ass`;

const resposta = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

function pedido(caminho: string, cookies: Record<string, string> = {}, { maioridade = true } = {}) {
  const todos = { ...(maioridade ? { leguele_maioridade: String(agora) } : {}), ...cookies };
  const cabecalho = Object.entries(todos)
    .map(([nome, valor]) => `${nome}=${valor}`)
    .join("; ");
  return new NextRequest(`http://localhost:3000${caminho}`, { headers: { cookie: cabecalho } });
}

const sessaoValida = { lb_acesso: jwt(1800), lb_renovacao: "renovacao-1", lb_manter: "1" };

describe("proxy: sessão e proteção das páginas", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
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

  it("a pergunta de maioridade continua vindo antes de tudo", async () => {
    const resultado = await proxy(pedido("/conta", sessaoValida, { maioridade: false }));

    expect(getRedirectUrl(resultado)).toContain("/maioridade?retorno=%2Fconta");
  });

  it.each(["/conta", "/checkout", "/admin"])(
    "visitante em %s vai para a tela de entrar e volta depois",
    async (caminho) => {
      const resultado = await proxy(pedido(caminho));

      expect(getRedirectUrl(resultado)).toBe(
        `http://localhost:3000/entrar?retorno=${encodeURIComponent(caminho)}`,
      );
    },
  );

  it("com a sessão em dia segue e renova a validade de 30 dias dos cookies (Manter-me conectado)", async () => {
    const resultado = await proxy(pedido("/conta", sessaoValida));

    expect(getRedirectUrl(resultado)).toBeNull();
    expect(fetchFalso).not.toHaveBeenCalled();
    for (const nome of ["lb_acesso", "lb_renovacao", "lb_manter"]) {
      expect(resultado.cookies.get(nome)).toMatchObject({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
  });

  it("sem Manter-me conectado não põe validade nos cookies, que seguem de sessão", async () => {
    const resultado = await proxy(pedido("/conta", { ...sessaoValida, lb_manter: "0" }));

    expect(resultado.cookies.get("lb_acesso")?.maxAge).toBeUndefined();
  });

  it("token de acesso perto de vencer: renova com o refresh token e segue com os cookies novos", async () => {
    fetchFalso.mockResolvedValue(
      resposta(200, {
        access_token: "acesso-novo",
        refresh_token: "renovacao-nova",
        user: { id: "u1", email: "ana@exemplo.com" },
      }),
    );

    const resultado = await proxy(pedido("/conta", { ...sessaoValida, lb_acesso: jwt(10) }));

    expect(fetchFalso.mock.calls[0]?.[0]).toBe(
      "http://auth.local/auth/v1/token?grant_type=refresh_token",
    );
    expect(JSON.parse((fetchFalso.mock.calls[0]?.[1] as RequestInit).body as string)).toEqual({
      refresh_token: "renovacao-1",
    });
    expect(resultado.cookies.get("lb_acesso")?.value).toBe("acesso-novo");
    expect(resultado.cookies.get("lb_renovacao")?.value).toBe("renovacao-nova");
    expect(getRedirectUrl(resultado)).toBeNull();
  });

  it("renovação recusada (sessão encerrada): apaga os cookies e manda entrar", async () => {
    fetchFalso.mockResolvedValue(resposta(400, { error_code: "refresh_token_not_found" }));

    const resultado = await proxy(pedido("/conta", { ...sessaoValida, lb_acesso: jwt(-5) }));

    expect(getRedirectUrl(resultado)).toBe("http://localhost:3000/entrar?retorno=%2Fconta");
    for (const nome of ["lb_acesso", "lb_renovacao", "lb_manter"]) {
      expect(resultado.cookies.get(nome)?.value).toBe("");
    }
  });

  it.each([
    ["erro 503 do Supabase", () => Promise.resolve(resposta(503, {}))],
    ["tempo esgotado", () => Promise.reject(new TypeError("timeout"))],
  ])(
    "renovação indisponível (%s): segue sem sessão nesta requisição e não apaga os cookies",
    async (_, simular) => {
      fetchFalso.mockImplementation(simular);

      const resultado = await proxy(pedido("/conta", { ...sessaoValida, lb_acesso: jwt(-5) }));

      expect(getRedirectUrl(resultado)).toBe("http://localhost:3000/entrar?retorno=%2Fconta");
      for (const nome of ["lb_acesso", "lb_renovacao", "lb_manter"]) {
        expect(resultado.cookies.get(nome)).toBeUndefined();
      }
    },
  );

  it("cliente comum em /admin vê a página não encontrada", async () => {
    fetchFalso.mockResolvedValue(resposta(200, { papel: "cliente" }));

    const resultado = await proxy(pedido("/admin", sessaoValida));

    expect(isRewrite(resultado)).toBe(true);
    expect(getRewrittenUrl(resultado)).toBe("http://localhost:3000/nao-encontrada");
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://api.local/me/profile");
    expect(init.headers).toMatchObject({ Authorization: `Bearer ${sessaoValida.lb_acesso}` });
  });

  it("admin segue em /admin", async () => {
    fetchFalso.mockResolvedValue(resposta(200, { papel: "admin" }));

    const resultado = await proxy(pedido("/admin", sessaoValida));

    expect(isRewrite(resultado)).toBe(false);
    expect(getRedirectUrl(resultado)).toBeNull();
  });

  it("API fora do ar em /admin fecha a porta: não encontrada", async () => {
    fetchFalso.mockRejectedValue(new TypeError("fora do ar"));

    const resultado = await proxy(pedido("/admin", sessaoValida));

    expect(getRewrittenUrl(resultado)).toBe("http://localhost:3000/nao-encontrada");
  });

  it("páginas abertas não consultam nada, mesmo com sessão", async () => {
    await proxy(pedido("/termos", sessaoValida));

    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
