import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { pedirRecuperacaoAction } = await import("./actions");

const resposta = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

describe("pedirRecuperacaoAction", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    fetchFalso.mockReset();
    vi.stubEnv("SUPABASE_URL", "http://auth.local");
    vi.stubEnv("SUPABASE_ANON_KEY", "chave-anonima");
    vi.stubEnv("SITE_URL", "https://leguele.exemplo");
    vi.stubGlobal("fetch", fetchFalso);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("pede o link com o endereço /nova-senha do próprio site (SITE_URL)", async () => {
    fetchFalso.mockResolvedValue(resposta(200, {}));

    expect(await pedirRecuperacaoAction({ email: "ana@exemplo.com" })).toEqual({ tipo: "enviado" });
    expect(fetchFalso.mock.calls[0]?.[0]).toBe(
      "http://auth.local/auth/v1/recover?redirect_to=https%3A%2F%2Fleguele.exemplo%2Fnova-senha",
    );
  });

  it("e-mail sem conta (o Supabase responde igual) e limite de pedidos mostram o mesmo aviso", async () => {
    fetchFalso.mockResolvedValueOnce(resposta(200, {}));
    fetchFalso.mockResolvedValueOnce(resposta(429, { error_code: "over_email_send_rate_limit" }));

    expect(await pedirRecuperacaoAction({ email: "ninguem@exemplo.com" })).toEqual({
      tipo: "enviado",
    });
    expect(await pedirRecuperacaoAction({ email: "ninguem@exemplo.com" })).toEqual({
      tipo: "enviado",
    });
  });

  it("e-mail inválido não chega ao Supabase", async () => {
    expect(await pedirRecuperacaoAction({ email: "ana@" })).toMatchObject({ tipo: "invalido" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("sem a configuração do Supabase devolve erro", async () => {
    vi.stubEnv("SUPABASE_URL", "");

    expect(await pedirRecuperacaoAction({ email: "ana@exemplo.com" })).toEqual({ tipo: "erro" });
  });
});
