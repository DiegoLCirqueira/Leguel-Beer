import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({ token: "acesso-1" as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) =>
      nome === "lb_acesso" && sessao.token ? { value: sessao.token } : undefined,
  }),
}));
const revalidar = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidatePath: revalidar }));

const { tornarPadraoAction, excluirEnderecoAction } = await import("./actions");

const ID = "0b9c6f0e-8f4e-4f43-a5a3-0b1a3f1f2c11";

describe("Server Actions dos endereços", () => {
  const fetchFalso = vi.fn();
  beforeEach(() => {
    sessao.token = "acesso-1";
    vi.stubGlobal("fetch", fetchFalso);
    vi.stubEnv("API_URL", "http://api.test");
  });
  afterEach(() => {
    fetchFalso.mockReset();
    revalidar.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("tornar padrão: POST /me/enderecos/:id/padrao com o token e atualiza a lista", async () => {
    fetchFalso.mockResolvedValue(new Response(null, { status: 204 }));

    const resultado = await tornarPadraoAction(ID);

    expect(fetchFalso).toHaveBeenCalledWith(
      `http://api.test/me/enderecos/${ID}/padrao`,
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer acesso-1" },
      }),
    );
    expect(resultado).toEqual({ tipo: "ok" });
    expect(revalidar).toHaveBeenCalledWith("/conta/enderecos");
  });

  it("excluir: DELETE /me/enderecos/:id com o token e atualiza a lista", async () => {
    fetchFalso.mockResolvedValue(new Response(null, { status: 204 }));

    const resultado = await excluirEnderecoAction(ID);

    expect(fetchFalso).toHaveBeenCalledWith(
      `http://api.test/me/enderecos/${ID}`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(resultado).toEqual({ tipo: "ok" });
    expect(revalidar).toHaveBeenCalledWith("/conta/enderecos");
  });

  it("sem sessão e 401 viram sem-sessao, sem chamar a API quando não há token", async () => {
    sessao.token = undefined;
    expect(await excluirEnderecoAction(ID)).toEqual({ tipo: "sem-sessao" });
    expect(fetchFalso).not.toHaveBeenCalled();

    sessao.token = "velho";
    fetchFalso.mockResolvedValue(new Response("{}", { status: 401 }));
    expect(await tornarPadraoAction(ID)).toEqual({ tipo: "sem-sessao" });
  });

  it("404 vira nao-encontrado e erro da API ou da rede vira erro, sem atualizar a lista", async () => {
    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 404 }));
    expect(await excluirEnderecoAction(ID)).toEqual({ tipo: "nao-encontrado" });
    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await tornarPadraoAction(ID)).toEqual({ tipo: "erro" });
    fetchFalso.mockRejectedValueOnce(new Error("rede"));
    expect(await tornarPadraoAction(ID)).toEqual({ tipo: "erro" });
    expect(revalidar).not.toHaveBeenCalled();
  });

  it("id que não é UUID não chega à API", async () => {
    expect(await excluirEnderecoAction("../../x")).toEqual({ tipo: "erro" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
