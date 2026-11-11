import type { CervejaDetalhe } from "@leguele/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarCerveja } from "./cerveja";

const cerveja: CervejaDetalhe = {
  id: "1",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
  descricao: "Uma IPA de respeito.",
  precoAnteriorCentavos: 3690,
  descontoPercentual: 13,
};

describe("buscarCerveja", () => {
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

  it("pede GET /catalogo/<slug> sem cache e devolve a cerveja válida", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify(cerveja), { status: 200 }));

    const resultado = await buscarCerveja("mare-alta");

    expect(fetchFalso).toHaveBeenCalledWith(
      "http://api.test/catalogo/mare-alta",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(resultado).toEqual({ tipo: "ok", cerveja });
  });

  it("escapa o slug na URL", async () => {
    fetchFalso.mockResolvedValue(new Response("{}", { status: 404 }));

    await buscarCerveja("a/b?c");

    expect(fetchFalso).toHaveBeenCalledWith(
      "http://api.test/catalogo/a%2Fb%3Fc",
      expect.anything(),
    );
  });

  it("404 é cerveja não encontrada; outros status, rede e corpo fora do contrato são erro", async () => {
    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 404 }));
    expect(await buscarCerveja("x")).toEqual({ tipo: "nao-encontrada" });

    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await buscarCerveja("x")).toEqual({ tipo: "erro" });

    fetchFalso.mockRejectedValueOnce(new Error("sem rede"));
    expect(await buscarCerveja("x")).toEqual({ tipo: "erro" });

    fetchFalso.mockResolvedValueOnce(new Response(JSON.stringify({ nome: 1 }), { status: 200 }));
    expect(await buscarCerveja("x")).toEqual({ tipo: "erro" });
  });

  it("uma API que não responde cai no erro depois de 8 segundos", async () => {
    vi.useFakeTimers();
    try {
      fetchFalso.mockImplementation(
        (_url: string, opcoes: { signal: AbortSignal }) =>
          new Promise((_resolve, rejeitar) => {
            opcoes.signal.addEventListener("abort", () => rejeitar(opcoes.signal.reason));
          }),
      );

      const busca = buscarCerveja("x");
      await vi.advanceTimersByTimeAsync(7999);
      expect(await Promise.race([busca, Promise.resolve("pendente")])).toBe("pendente");
      await vi.advanceTimersByTimeAsync(1);

      expect(await busca).toEqual({ tipo: "erro" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("destaques é slug reservado da API: vira não encontrada sem nem perguntar à API", async () => {
    const resultado = await buscarCerveja("destaques");

    expect(resultado).toEqual({ tipo: "nao-encontrada" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
