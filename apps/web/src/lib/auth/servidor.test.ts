import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: async () => ({}) }));

const { criarClienteApi } = await import("./servidor");

const sessao = {
  accessToken: "acesso",
  refreshToken: "renovacao",
  user: { id: "u1", email: "ana@exemplo.com", metadata: {} },
};

describe("criarClienteApi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("em produção sem API_URL falha de forma visível, em vez de criar o perfil em silêncio", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("API_URL", "");

    expect(() => criarClienteApi(sessao)).toThrow(/API_URL/);
  });

  it("em produção com API_URL cria o cliente", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("API_URL", "https://api.leguele.exemplo");

    expect(() => criarClienteApi(sessao)).not.toThrow();
  });

  it("fora de produção, sem API_URL, usa a API local", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("API_URL", "");

    expect(() => criarClienteApi(sessao)).not.toThrow();
  });
});
