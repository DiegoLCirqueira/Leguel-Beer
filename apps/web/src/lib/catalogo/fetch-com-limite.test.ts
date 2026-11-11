import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarComLimite } from "./fetch-com-limite";

describe("buscarComLimite", () => {
  const fetchFalso = vi.fn();
  beforeEach(() => vi.stubGlobal("fetch", fetchFalso));
  afterEach(() => {
    fetchFalso.mockReset();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("pede a URL sem cache e devolve o que o tratamento extrai da resposta", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify({ a: 1 }), { status: 200 }));

    const corpo = await buscarComLimite("http://api.test/x", (r) => r.json());

    expect(fetchFalso).toHaveBeenCalledWith(
      "http://api.test/x",
      expect.objectContaining({ cache: "no-store", signal: expect.any(AbortSignal) }),
    );
    expect(corpo).toEqual({ a: 1 });
  });

  it("aborta e rejeita depois de 8 segundos sem resposta, e não antes", async () => {
    vi.useFakeTimers();
    fetchFalso.mockImplementation(
      (_url: string, opcoes: { signal: AbortSignal }) =>
        new Promise((_resolve, rejeitar) => {
          opcoes.signal.addEventListener("abort", () => rejeitar(opcoes.signal.reason));
        }),
    );

    const busca = buscarComLimite("http://api.test/x", (r) => r.json());
    const resultado = busca.then(
      () => "resolveu",
      () => "rejeitou",
    );
    await vi.advanceTimersByTimeAsync(7999);
    expect(await Promise.race([resultado, Promise.resolve("pendente")])).toBe("pendente");
    await vi.advanceTimersByTimeAsync(1);

    expect(await resultado).toBe("rejeitou");
  });
});
