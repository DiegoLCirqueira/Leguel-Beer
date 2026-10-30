import { ApiError, perfilResponseSchema } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { createApiClient } from "./api-client";

type Reply = { status: number; body: unknown };

function fakeFetch(replies: Reply[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchFake = (input: string | URL | Request, init: RequestInit = {}) => {
    calls.push({ url: String(input), init });
    const reply = replies.shift() ?? { status: 500, body: {} };
    return Promise.resolve(new Response(JSON.stringify(reply.body), { status: reply.status }));
  };
  return { fetch: fetchFake as typeof fetch, calls };
}

const perfil = {
  id: "0b0f6f0e-3f65-4e4e-8a4e-5d6a7c2d9a11",
  email: "ana@exemplo.com",
  nome: "Ana Souza",
  telefone: "82912345678",
  papel: "cliente",
  aceite: {
    termosVersao: "2026-10-29",
    privacidadeVersao: "2026-10-29",
    aceitoEm: "2026-10-30T12:00:00.000Z",
  },
};

function clientWith(replies: Reply[], refreshSession = () => Promise.resolve<string | null>(null)) {
  const { fetch, calls } = fakeFetch(replies);
  const client = createApiClient({
    baseUrl: "http://api.test",
    fetch,
    getToken: () => Promise.resolve("token-velho"),
    refreshSession,
  });
  return { client, calls };
}

describe("createApiClient", () => {
  it("envia o token em Authorization: Bearer e valida a resposta com o schema", async () => {
    const { client, calls } = clientWith([{ status: 200, body: perfil }]);

    const result = await client.request("/perfil", { schema: perfilResponseSchema });

    expect(result).toEqual(perfil);
    expect(calls[0]?.url).toBe("http://api.test/perfil");
    expect(calls[0]?.init.headers).toMatchObject({ Authorization: "Bearer token-velho" });
  });

  it("lança um erro de API tipado com code, message e details quando a API responde 400", async () => {
    const { client } = clientWith([
      {
        status: 400,
        body: {
          code: "VALIDATION_ERROR",
          message: "Dados inválidos.",
          details: [{ field: "telefone", message: "Informe um telefone com DDD." }],
        },
      },
    ]);

    const error = await client.request("/perfil", { method: "POST", body: {} }).catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Dados inválidos.",
      details: [{ field: "telefone", message: "Informe um telefone com DDD." }],
    });
  });

  it("em 401 renova a sessão uma vez e repete a chamada com o token novo", async () => {
    let renovacoes = 0;
    const { client, calls } = clientWith(
      [
        { status: 401, body: { code: "UNAUTHORIZED", message: "Não autenticado." } },
        { status: 200, body: perfil },
      ],
      () => {
        renovacoes++;
        return Promise.resolve("token-novo");
      },
    );

    const result = await client.request("/perfil", { schema: perfilResponseSchema });

    expect(result).toEqual(perfil);
    expect(renovacoes).toBe(1);
    expect(calls).toHaveLength(2);
    expect(calls[1]?.init.headers).toMatchObject({ Authorization: "Bearer token-novo" });
  });

  it.each([
    ["devolve null", () => Promise.resolve<string | null>(null)],
    ["falha", () => Promise.reject(new Error("refresh token vencido"))],
  ])("se a renovação %s, lança UNAUTHORIZED sem repetir a chamada", async (_caso, refresh) => {
    const { client, calls } = clientWith(
      [{ status: 401, body: { code: "UNAUTHORIZED", message: "Não autenticado." } }],
      refresh,
    );

    const error = await client.request("/perfil").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(calls).toHaveLength(1);
  });

  it("renova no máximo uma vez: um segundo 401 lança UNAUTHORIZED", async () => {
    let renovacoes = 0;
    const unauthorized = { code: "UNAUTHORIZED", message: "Não autenticado." };
    const { client, calls } = clientWith(
      [
        { status: 401, body: unauthorized },
        { status: 401, body: unauthorized },
      ],
      () => {
        renovacoes++;
        return Promise.resolve("token-novo");
      },
    );

    const error = await client.request("/perfil").catch((e) => e);

    expect(error).toMatchObject({ status: 401, code: "UNAUTHORIZED" });
    expect(renovacoes).toBe(1);
    expect(calls).toHaveLength(2);
  });
});
