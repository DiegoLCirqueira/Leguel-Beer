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

  it.each([
    ["erro do serviço", () => Promise.resolve(resposta(500, { msg: "falhou" }))],
    ["limite de tentativas", () => Promise.resolve(resposta(429, { msg: "limite" }))],
    ["falha de rede", () => Promise.reject(new TypeError("fetch failed"))],
  ])("devolve erro quando há %s", async (_, simular) => {
    const auth = createGoTrue({ ...config, fetch: vi.fn().mockImplementation(simular) });

    expect(await auth.signUp(dados)).toEqual({ tipo: "erro" });
  });
});
