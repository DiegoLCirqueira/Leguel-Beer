import type { CervejaCard } from "@leguele/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarDestaques } from "./destaques";

const cerveja: CervejaCard = {
  id: "1",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 55,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
};

describe("buscarDestaques", () => {
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

  it("pede GET /catalogo/destaques sem cache e devolve os itens válidos", async () => {
    fetchFalso.mockResolvedValue(
      new Response(JSON.stringify({ itens: [cerveja] }), { status: 200 }),
    );

    const resultado = await buscarDestaques();

    expect(fetchFalso).toHaveBeenCalledWith(
      "http://api.test/catalogo/destaques",
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(resultado).toEqual({ ok: true, itens: [cerveja] });
  });

  it("falha de rede, erro da API ou corpo fora do contrato (7 itens) viram erro, sem lançar", async () => {
    fetchFalso.mockRejectedValueOnce(new Error("sem rede"));
    expect(await buscarDestaques()).toEqual({ ok: false });

    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await buscarDestaques()).toEqual({ ok: false });

    const sete = Array.from({ length: 7 }, () => cerveja);
    fetchFalso.mockResolvedValueOnce(
      new Response(JSON.stringify({ itens: sete }), { status: 200 }),
    );
    expect(await buscarDestaques()).toEqual({ ok: false });
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

      const busca = buscarDestaques();
      await vi.advanceTimersByTimeAsync(7999);
      expect(await Promise.race([busca, Promise.resolve("pendente")])).toBe("pendente");
      await vi.advanceTimersByTimeAsync(1);

      expect(await busca).toEqual({ ok: false });
    } finally {
      vi.useRealTimers();
    }
  });
});
