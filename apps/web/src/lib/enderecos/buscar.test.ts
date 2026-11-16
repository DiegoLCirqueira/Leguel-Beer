import type { EnderecoResposta } from "@leguele/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buscarEnderecos } from "./buscar";

const casa: EnderecoResposta = {
  id: "e1",
  apelido: "Casa",
  cep: "57035000",
  rua: "Avenida Fernandes Lima",
  numero: "100",
  bairro: "Farol",
  cidade: "Maceió",
  uf: "AL",
  padrao: true,
  foraDaArea: false,
};

describe("buscarEnderecos", () => {
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

  it("pede GET /me/enderecos com o token da sessão e devolve a lista válida", async () => {
    fetchFalso.mockResolvedValue(new Response(JSON.stringify([casa]), { status: 200 }));

    const resultado = await buscarEnderecos("token-1");

    expect(fetchFalso).toHaveBeenCalledWith(
      "http://api.test/me/enderecos",
      expect.objectContaining({
        cache: "no-store",
        headers: { Authorization: "Bearer token-1" },
      }),
    );
    expect(resultado).toEqual({ tipo: "ok", enderecos: [casa] });
  });
});
