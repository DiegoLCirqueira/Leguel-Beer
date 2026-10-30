import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cabecalhos = new Map([
  ["host", "localhost:3000"],
  ["x-forwarded-proto", "http"],
]);
vi.mock("next/headers", () => ({
  headers: async () => ({ get: (n: string) => cabecalhos.get(n) ?? null }),
}));

const { criarContaAction } = await import("./actions");

const entrada = {
  nome: "Ana Souza",
  email: "ana@exemplo.com",
  telefone: "(82) 99999-0000",
  senha: "senha-segura",
  confirmacao: "senha-segura",
  aceite: true,
};

describe("criarContaAction", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "http://auth.local");
    vi.stubEnv("SUPABASE_ANON_KEY", "chave-anonima");
    vi.stubGlobal("fetch", fetchFalso);
    fetchFalso.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("cadastra no Supabase com o endereço de confirmação do próprio site", async () => {
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ identities: [{}] }), { status: 200 }),
    );

    const resultado = await criarContaAction(entrada);

    expect(resultado).toEqual({ tipo: "enviado", email: "ana@exemplo.com" });
    expect(fetchFalso.mock.calls[0]?.[0]).toBe(
      "http://auth.local/auth/v1/signup?redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fconfirmar",
    );
  });

  it("sem a configuração do Supabase devolve erro, sem chamar a rede", async () => {
    vi.stubEnv("SUPABASE_URL", "");

    expect(await criarContaAction(entrada)).toEqual({ tipo: "erro" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("não chama a rede com dados inválidos, mesmo que o navegador tenha pulado a validação", async () => {
    const resultado = await criarContaAction({ ...entrada, senha: "abc", confirmacao: "abc" });

    expect(resultado.tipo).toBe("invalido");
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
