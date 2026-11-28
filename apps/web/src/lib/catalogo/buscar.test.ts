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
    fetchFalso.mockRejectedValue(new Error("sem rede"));
    expect(await buscarCatalogo(query)).toEqual({ ok: false });
    fetchFalso.mockReset();

    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await buscarCatalogo(query)).toEqual({ ok: false });

    fetchFalso.mockResolvedValueOnce(new Response(JSON.stringify({ itens: 1 }), { status: 200 }));
    expect(await buscarCatalogo(query)).toEqual({ ok: false });
  });

  it("um 429 com Retry-After curto (até 2 s) é tentado de novo uma vez, e a segunda resposta vale", async () => {
    fetchFalso
      .mockResolvedValueOnce(new Response("{}", { status: 429, headers: { "Retry-After": "1" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(resposta), { status: 200 }));

    const resultado = await buscarCatalogo(query);

    expect(resultado).toEqual({ ok: true, dados: resposta });
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it("falha de rede também é tentada de novo uma vez", async () => {
    fetchFalso
      .mockRejectedValueOnce(new Error("sem rede"))
      .mockResolvedValueOnce(new Response(JSON.stringify(resposta), { status: 200 }));

    expect(await buscarCatalogo(query)).toEqual({ ok: true, dados: resposta });
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it("se a segunda tentativa também falha, devolve o erro (só 2 chamadas, sem esconder)", async () => {
    fetchFalso.mockResolvedValue(new Response("{}", { status: 503 }));

    expect(await buscarCatalogo(query)).toEqual({ ok: false });
    expect(fetchFalso).toHaveBeenCalledTimes(2);
  });

  it.each([400, 404, 500])("erro real %i não é repetido", async (status) => {
    fetchFalso.mockResolvedValue(new Response("{}", { status }));

    expect(await buscarCatalogo(query)).toEqual({ ok: false });
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it("corpo fora do contrato não é repetido", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify({ itens: 1 }), { status: 200 }));

    expect(await buscarCatalogo(query)).toEqual({ ok: false });
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it("uma API que não responde cai no estado de erro depois de 8 segundos", async () => {
    vi.useFakeTimers();
    try {
      fetchFalso.mockImplementation(
        (_url: string, opcoes: { signal: AbortSignal }) =>
          new Promise((_resolve, rejeitar) => {
            opcoes.signal.addEventListener("abort", () => rejeitar(opcoes.signal.reason));
          }),
      );

      const busca = buscarCatalogo(query);
      await vi.advanceTimersByTimeAsync(7999);
      expect(await Promise.race([busca, Promise.resolve("pendente")])).toBe("pendente");
      await vi.advanceTimersByTimeAsync(1);

      expect(await busca).toEqual({ ok: false });
      expect(fetchFalso).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("429 sem Retry-After ou com espera longa não é repetido (o retry só gastaria o limite)", async () => {
    fetchFalso.mockResolvedValue(
      new Response("{}", { status: 429, headers: { "Retry-After": "30" } }),
    );
    expect(await buscarCatalogo(query)).toEqual({ ok: false });
    expect(fetchFalso).toHaveBeenCalledTimes(1);

    fetchFalso.mockReset();
    fetchFalso.mockResolvedValue(new Response("{}", { status: 429 }));
    expect(await buscarCatalogo(query)).toEqual({ ok: false });
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it.each(["", "  ", "abc", "-1"])(
    "429 com Retry-After %j (vazio ou inválido) conta como ausente: sem retry",
    async (valor) => {
      fetchFalso.mockResolvedValue(
        new Response("{}", { status: 429, headers: { "Retry-After": valor } }),
      );

      expect(await buscarCatalogo(query)).toEqual({ ok: false });
      expect(fetchFalso).toHaveBeenCalledTimes(1);
    },
  );

  it("as duas tentativas dividem um orçamento total de 8 s: a segunda só tem o que restou", async () => {
    vi.useFakeTimers();
    try {
      let chamada = 0;
      fetchFalso.mockImplementation((_url: string, opcoes: { signal: AbortSignal }) => {
        chamada += 1;
        return new Promise((_resolve, rejeitar) => {
          if (chamada === 1) setTimeout(() => rejeitar(new Error("sem rede")), 5000);
          else opcoes.signal.addEventListener("abort", () => rejeitar(opcoes.signal.reason));
        });
      });

      const busca = buscarCatalogo(query);
      await vi.advanceTimersByTimeAsync(7999);
      expect(await Promise.race([busca, Promise.resolve("pendente")])).toBe("pendente");
      await vi.advanceTimersByTimeAsync(1);

      expect(await busca).toEqual({ ok: false });
      expect(fetchFalso).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});
