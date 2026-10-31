import { describe, expect, it, vi } from "vitest";
import { createGoTrue } from "./gotrue";

const config = { url: "http://auth.local", anonKey: "chave-anonima" };

const dados = {
  email: "ana@exemplo.com",
  senha: "senha-segura",
  metadata: { nome: "Ana Souza", telefone: "82999990000", aceite: true as const },
  redirectTo: "http://localhost:3000/auth/confirmar",
};

function resposta(status: number, corpo: unknown) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("GoTrue signUp", () => {
  it("envia e-mail, senha e os dados do perfil e avisa que o link foi enviado", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, { id: "u1", identities: [{}] }));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    const resultado = await auth.signUp(dados);

    expect(resultado).toEqual({ tipo: "enviado" });
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "http://auth.local/auth/v1/signup?redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fconfirmar",
    );
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ apikey: "chave-anonima" });
    expect(JSON.parse(init.body as string)).toEqual({
      email: "ana@exemplo.com",
      password: "senha-segura",
      data: { nome: "Ana Souza", telefone: "82999990000", aceite: true },
    });
  });

  it("reconhece o e-mail que já tem conta pela lista de identidades vazia", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, { id: "u1", identities: [] }));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.signUp(dados)).toEqual({ tipo: "email-ja-cadastrado" });
  });

  it("reconhece o e-mail já registrado pelo erro user_already_exists (422) do Supabase", async () => {
    const fetchFalso = vi
      .fn()
      .mockResolvedValue(
        resposta(422, { error_code: "user_already_exists", msg: "User already registered" }),
      );
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.signUp(dados)).toEqual({ tipo: "email-ja-cadastrado" });
  });

  it.each([
    ["erro do serviço", () => Promise.resolve(resposta(500, { msg: "falhou" }))],
    ["limite de tentativas", () => Promise.resolve(resposta(429, { msg: "limite" }))],
    ["falha de rede", () => Promise.reject(new TypeError("fetch failed"))],
  ])("devolve erro quando há %s", async (_, simular) => {
    const auth = createGoTrue({ ...config, fetch: vi.fn().mockImplementation(simular) });

    expect(await auth.signUp(dados)).toEqual({ tipo: "erro" });
  });
});

const sessaoGoTrue = {
  access_token: "acesso-1",
  refresh_token: "renovacao-1",
  expires_in: 3600,
  user: { id: "u1", email: "ana@exemplo.com", user_metadata: { nome: "Ana Souza" } },
};
const sessaoEsperada = {
  accessToken: "acesso-1",
  refreshToken: "renovacao-1",
  user: { id: "u1", email: "ana@exemplo.com", metadata: { nome: "Ana Souza" } },
};

describe("GoTrue signInPassword", () => {
  it("entra com e-mail e senha e devolve a sessão", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, sessaoGoTrue));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    const resultado = await auth.signInPassword("ana@exemplo.com", "senha-segura");

    expect(resultado).toEqual({ tipo: "ok", sessao: sessaoEsperada });
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/token?grant_type=password");
    expect(JSON.parse(init.body as string)).toEqual({
      email: "ana@exemplo.com",
      password: "senha-segura",
    });
  });

  it.each([
    ["credenciais inválidas", { error_code: "invalid_credentials" }, { tipo: "credenciais" }],
    ["e-mail não confirmado", { error_code: "email_not_confirmed" }, { tipo: "nao-confirmado" }],
    ["erro do serviço", { error_code: "unexpected_failure" }, { tipo: "erro" }],
  ])("traduz %s", async (_, corpo, esperado) => {
    const auth = createGoTrue({
      ...config,
      fetch: vi
        .fn()
        .mockResolvedValue(resposta(corpo.error_code === "unexpected_failure" ? 500 : 400, corpo)),
    });

    expect(await auth.signInPassword("ana@exemplo.com", "x")).toEqual(esperado);
  });

  it("falha de rede vira erro", async () => {
    const auth = createGoTrue({ ...config, fetch: vi.fn().mockRejectedValue(new TypeError("x")) });

    expect(await auth.signInPassword("ana@exemplo.com", "x")).toEqual({ tipo: "erro" });
  });
});

describe("GoTrue refresh, verify, resend e signOut", () => {
  it("renova a sessão com o refresh token", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, sessaoGoTrue));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.refresh("renovacao-0")).toEqual({ tipo: "ok", sessao: sessaoEsperada });
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/token?grant_type=refresh_token");
    expect(JSON.parse(init.body as string)).toEqual({ refresh_token: "renovacao-0" });
  });

  it.each([400, 401])(
    "devolve recusada quando o Supabase recusa a renovação (%i): a sessão acabou",
    async (status) => {
      const auth = createGoTrue({
        ...config,
        fetch: vi.fn().mockResolvedValue(resposta(status, {})),
      });

      expect(await auth.refresh("vencido")).toEqual({ tipo: "recusada" });
    },
  );

  it.each([
    ["erro 503 do serviço", () => Promise.resolve(resposta(503, {}))],
    ["erro 500 do serviço", () => Promise.resolve(resposta(500, {}))],
    ["falha de rede ou tempo esgotado", () => Promise.reject(new TypeError("timeout"))],
  ])("devolve indisponivel em %s: não dá para saber se a sessão acabou", async (_, simular) => {
    const auth = createGoTrue({ ...config, fetch: vi.fn().mockImplementation(simular) });

    expect(await auth.refresh("qualquer")).toEqual({ tipo: "indisponivel" });
  });

  it("confirma o e-mail pelo token do link e devolve a sessão", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, sessaoGoTrue));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.verify({ tokenHash: "hash-1", type: "signup" })).toEqual(sessaoEsperada);
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/verify");
    expect(JSON.parse(init.body as string)).toEqual({ type: "signup", token_hash: "hash-1" });
  });

  it("devolve null quando o link é inválido ou vencido", async () => {
    const auth = createGoTrue({ ...config, fetch: vi.fn().mockResolvedValue(resposta(403, {})) });

    expect(await auth.verify({ tokenHash: "ruim", type: "signup" })).toBeNull();
  });

  it("reenvia o link de confirmação", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, {}));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.resend("ana@exemplo.com", "http://localhost:3000/auth/confirmar")).toBe(
      "enviado",
    );
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/resend");
    expect(JSON.parse(init.body as string)).toEqual({
      type: "signup",
      email: "ana@exemplo.com",
      options: { email_redirect_to: "http://localhost:3000/auth/confirmar" },
    });
  });

  it("encerra a sessão deste aparelho (escopo local) com o token de acesso", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.signOut("acesso-1")).toBe(true);
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/logout?scope=local");
    expect(init.headers).toMatchObject({ Authorization: "Bearer acesso-1" });
  });
});

describe("GoTrue recuperação de senha", () => {
  it("pede o e-mail de recuperação com o endereço de retorno", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, {}));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.recover("ana@exemplo.com", "http://localhost:3000/nova-senha")).toBe(
      "enviado",
    );
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      "http://auth.local/auth/v1/recover?redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fnova-senha",
    );
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ email: "ana@exemplo.com" });
  });

  it("o limite de pedidos (429) aparece como limite, para a tela mostrar o mesmo aviso", async () => {
    const auth = createGoTrue({
      ...config,
      fetch: vi.fn().mockResolvedValue(resposta(429, { error_code: "over_email_send_rate_limit" })),
    });

    expect(await auth.recover("ana@exemplo.com", "http://x")).toBe("limite");
  });

  it.each([
    ["erro do serviço", () => Promise.resolve(resposta(500, {}))],
    ["falha de rede", () => Promise.reject(new TypeError("rede"))],
  ])("devolve erro quando há %s", async (_, simular) => {
    const auth = createGoTrue({ ...config, fetch: vi.fn().mockImplementation(simular) });

    expect(await auth.recover("ana@exemplo.com", "http://x")).toBe("erro");
  });

  it("confirma o link de recuperação pelo mesmo verify, com o tipo recovery", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, sessaoGoTrue));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.verify({ tokenHash: "hash-2", type: "recovery" })).toEqual(sessaoEsperada);
    const [, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ type: "recovery", token_hash: "hash-2" });
  });

  it("troca a senha da sessão com PUT /user e o token de acesso", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(resposta(200, { id: "u1" }));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.updatePassword("acesso-1", "nova-senha-123")).toBe(true);
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/user");
    expect(init.method).toBe("PUT");
    expect(init.headers).toMatchObject({ Authorization: "Bearer acesso-1" });
    expect(JSON.parse(init.body as string)).toEqual({ password: "nova-senha-123" });
  });

  it("devolve false quando a troca de senha é recusada ou falha", async () => {
    const recusada = createGoTrue({
      ...config,
      fetch: vi.fn().mockResolvedValue(resposta(422, {})),
    });
    const rede = createGoTrue({ ...config, fetch: vi.fn().mockRejectedValue(new TypeError("x")) });

    expect(await recusada.updatePassword("acesso-1", "x")).toBe(false);
    expect(await rede.updatePassword("acesso-1", "x")).toBe(false);
  });

  it("encerra as outras sessões da conta (escopo others), mantendo a atual", async () => {
    const fetchFalso = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const auth = createGoTrue({ ...config, fetch: fetchFalso });

    expect(await auth.signOutOthers("acesso-1")).toBe(true);
    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/logout?scope=others");
    expect(init.headers).toMatchObject({ Authorization: "Bearer acesso-1" });
  });
});
