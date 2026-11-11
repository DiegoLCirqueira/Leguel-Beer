import type { GeladeiraResponse } from "@leguele/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({ token: "acesso-1" as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) =>
      nome === "lb_acesso" && sessao.token ? { value: sessao.token } : undefined,
  }),
}));

const { buscarGeladeiraDaContaAction, enviarGeladeiraParaContaAction } = await import("./actions");

const vazia: GeladeiraResponse = {
  itens: [],
  ajustes: [],
  quantidadeTotal: 0,
  subtotalCentavos: 0,
};
const json = (status: number, corpo: unknown) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
const pedido = { itens: [{ cervejaId: "a", quantidade: 2, precoVistoCentavos: 3200 }] };

describe("Server Actions da Geladeira da conta", () => {
  const fetchFalso = vi.fn();
  beforeEach(() => {
    sessao.token = "acesso-1";
    vi.stubGlobal("fetch", fetchFalso);
    vi.stubEnv("API_URL", "http://api.test");
  });
  afterEach(() => {
    fetchFalso.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("GET /me/geladeira com o token da sessão devolve a Geladeira validada", async () => {
    fetchFalso.mockResolvedValue(json(200, vazia));

    const resultado = await buscarGeladeiraDaContaAction();

    expect(fetchFalso).toHaveBeenCalledWith(
      "http://api.test/me/geladeira",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "Bearer acesso-1" }),
      }),
    );
    expect(resultado).toEqual({ tipo: "ok", resposta: vazia });
  });

  it("PUT /me/geladeira leva a Geladeira inteira e devolve a resposta", async () => {
    fetchFalso.mockResolvedValue(json(200, vazia));

    const resultado = await enviarGeladeiraParaContaAction(pedido);

    const [, opcoes] = fetchFalso.mock.calls[0] as [string, { method: string; body: string }];
    expect(opcoes.method).toBe("PUT");
    expect(JSON.parse(opcoes.body)).toEqual(pedido);
    expect(resultado).toEqual({ tipo: "ok", resposta: vazia });
  });

  it("sem sessão (sem cookie, ou 401 da API) é sem-sessao e sem perfil (409) é sem-perfil", async () => {
    sessao.token = undefined;
    expect(await buscarGeladeiraDaContaAction()).toEqual({ tipo: "sem-sessao" });
    expect(fetchFalso).not.toHaveBeenCalled();

    sessao.token = "acesso-1";
    fetchFalso.mockResolvedValueOnce(json(401, { code: "UNAUTHORIZED", message: "x" }));
    expect(await buscarGeladeiraDaContaAction()).toEqual({ tipo: "sem-sessao" });

    fetchFalso.mockResolvedValueOnce(json(409, { code: "PROFILE_REQUIRED", message: "x" }));
    expect(await enviarGeladeiraParaContaAction(pedido)).toEqual({ tipo: "sem-perfil" });
  });

  it("falha de rede, outro status, resposta fora do contrato e pedido inválido viram erro, sem lançar", async () => {
    fetchFalso.mockRejectedValueOnce(new Error("sem rede"));
    expect(await buscarGeladeiraDaContaAction()).toEqual({ tipo: "erro" });

    fetchFalso.mockResolvedValueOnce(json(500, {}));
    expect(await enviarGeladeiraParaContaAction(pedido)).toEqual({ tipo: "erro" });

    fetchFalso.mockResolvedValueOnce(json(200, { itens: 1 }));
    expect(await buscarGeladeiraDaContaAction()).toEqual({ tipo: "erro" });

    fetchFalso.mockClear();
    const invalido = { itens: [{ cervejaId: "a", quantidade: 0, precoVistoCentavos: 1 }] };
    expect(await enviarGeladeiraParaContaAction(invalido)).toEqual({ tipo: "erro" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
