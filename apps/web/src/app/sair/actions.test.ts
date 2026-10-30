import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const jar = new Map<string, string>();
const apagados: string[] = [];
const redirect = vi.fn((destino: string) => {
  throw new Error(`REDIRECT:${destino}`);
});

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) => (jar.has(nome) ? { value: jar.get(nome) } : undefined),
    delete: (nome: string) => apagados.push(nome),
  }),
}));
vi.mock("next/navigation", () => ({ redirect }));

const { sairAction } = await import("./actions");

describe("sairAction", () => {
  const fetchFalso = vi.fn();

  beforeEach(() => {
    jar.clear();
    apagados.length = 0;
    fetchFalso.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubEnv("SUPABASE_URL", "http://auth.local");
    vi.stubEnv("SUPABASE_ANON_KEY", "chave-anonima");
    vi.stubGlobal("fetch", fetchFalso);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("encerra a sessão deste aparelho no Supabase, apaga os cookies e leva à boas-vindas", async () => {
    jar.set("lb_acesso", "acesso-1");

    await expect(sairAction()).rejects.toThrow("REDIRECT:/boas-vindas");

    const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://auth.local/auth/v1/logout?scope=local");
    expect(init.headers).toMatchObject({ Authorization: "Bearer acesso-1" });
    expect(apagados.sort()).toEqual(["lb_acesso", "lb_manter", "lb_renovacao"]);
  });

  it("sem sessão apenas apaga os cookies e vai à boas-vindas, sem chamar o Supabase", async () => {
    await expect(sairAction()).rejects.toThrow("REDIRECT:/boas-vindas");

    expect(fetchFalso).not.toHaveBeenCalled();
    expect(apagados).toHaveLength(3);
  });

  it("falha ao falar com o Supabase não deixa a pessoa logada neste aparelho", async () => {
    jar.set("lb_acesso", "acesso-1");
    fetchFalso.mockRejectedValue(new TypeError("rede"));

    await expect(sairAction()).rejects.toThrow("REDIRECT:/boas-vindas");
    expect(apagados).toHaveLength(3);
  });
});
