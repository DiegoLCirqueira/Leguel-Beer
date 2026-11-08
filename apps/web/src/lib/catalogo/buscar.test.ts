import type { CatalogoQuery, CatalogoResponse } from "@leguele/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarCatalogo } from "./buscar";

const query: CatalogoQuery = { categoria: "ipa", disponiveis: true, ordem: "menor-preco" };

const resposta: CatalogoResponse = {
  itens: [],
  total: 0,
  categorias: [{ slug: "ipa", nome: "IPA", ordem: 1, quantidade: 6 }],
};

describe("buscarCatalogo", () => {
  const fetchFalso = vi.fn();
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchFalso);
    vi.stubEnv("API_URL", "http://api.test");
  });
  afterEach(() => {
    fetchFalso.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("pede GET /catalogo com os filtros e a ordem na query e devolve os dados válidos", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify(resposta), { status: 200 }));

    const resultado = await buscarCatalogo(query);

    expect(fetchFalso).toHaveBeenCalledWith(
      "http://api.test/catalogo?categoria=ipa&disponiveis=true&ordem=menor-preco",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(resultado).toEqual({ ok: true, dados: resposta });
  });

  it("sem filtros pede /catalogo sem query", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify(resposta), { status: 200 }));

    await buscarCatalogo({ disponiveis: false, ordem: "relevancia" });

    expect(fetchFalso).toHaveBeenCalledWith("http://api.test/catalogo", expect.anything());
  });

  it("falha de rede, status de erro ou corpo fora do contrato viram erro, sem lançar", async () => {
    fetchFalso.mockRejectedValueOnce(new Error("sem rede"));
    expect(await buscarCatalogo(query)).toEqual({ ok: false });

    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await buscarCatalogo(query)).toEqual({ ok: false });

    fetchFalso.mockResolvedValueOnce(new Response(JSON.stringify({ itens: 1 }), { status: 200 }));
    expect(await buscarCatalogo(query)).toEqual({ ok: false });
  });
});
