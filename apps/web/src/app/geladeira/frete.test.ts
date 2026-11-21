import type { EnderecoResposta } from "@leguele/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({ token: "acesso-1" as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) =>
      nome === "lb_acesso" && sessao.token ? { value: sessao.token } : undefined,
  }),
}));

const { cotarFreteDoPadraoAction, cotarFreteDoEnderecoAction } = await import("./frete");

const ID = "0b9c6f0e-8f4e-4f43-a5a3-0b1a3f1f2c11";
const endereco = (extra: Partial<EnderecoResposta>): EnderecoResposta => ({
  id: ID,
  apelido: "Casa",
  cep: "57035000",
  rua: "Avenida Fernandes Lima",
  numero: "100",
  bairro: "Farol",
  cidade: "Maceió",
  uf: "AL",
  padrao: true,
  foraDaArea: false,
  ...extra,
});
const json = (corpo: unknown, status = 200) => new Response(JSON.stringify(corpo), { status });

describe("cotarFreteDoPadraoAction", () => {
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

  it("sem sessão não chama a API", async () => {
    sessao.token = undefined;

    expect(await cotarFreteDoPadraoAction()).toEqual({ tipo: "sem-sessao" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("cota o endereço padrão com o token e devolve o valor", async () => {
    fetchFalso
      .mockResolvedValueOnce(json([endereco({ id: "outro", padrao: false }), endereco({})]))
      .mockResolvedValueOnce(json({ naArea: true, freteCentavos: 1300, gratis: false }));

    expect(await cotarFreteDoPadraoAction()).toEqual({
      tipo: "frete",
      frete: { tipo: "valor", centavos: 1300 },
    });
    const [url, opcoes] = fetchFalso.mock.calls[1]!;
    expect(url).toBe(`http://api.test/me/enderecos/${ID}/frete`);
    expect(opcoes.headers.Authorization).toBe("Bearer acesso-1");
  });

  it("frete grátis", async () => {
    fetchFalso
      .mockResolvedValueOnce(json([endereco({})]))
      .mockResolvedValueOnce(json({ naArea: true, freteCentavos: 0, gratis: true }));

    expect(await cotarFreteDoPadraoAction()).toEqual({ tipo: "frete", frete: { tipo: "gratis" } });
  });

  it("endereço fora da área", async () => {
    fetchFalso
      .mockResolvedValueOnce(json([endereco({})]))
      .mockResolvedValueOnce(json({ naArea: false }));

    expect(await cotarFreteDoPadraoAction()).toEqual({
      tipo: "frete",
      frete: { tipo: "fora-da-area" },
    });
  });

  it("sem endereço padrão, pede o endereço", async () => {
    fetchFalso.mockResolvedValueOnce(json([endereco({ padrao: false })]));

    expect(await cotarFreteDoPadraoAction()).toEqual({ tipo: "sem-endereco" });
    expect(fetchFalso).toHaveBeenCalledTimes(1);
  });

  it("erro da cotação ou da lista vira frete indisponível", async () => {
    fetchFalso
      .mockResolvedValueOnce(json([endereco({})]))
      .mockResolvedValueOnce(json({ code: "MAPS_UNAVAILABLE" }, 503));
    expect(await cotarFreteDoPadraoAction()).toEqual({
      tipo: "frete",
      frete: { tipo: "indisponivel" },
    });

    fetchFalso.mockRejectedValueOnce(new Error("rede"));
    expect(await cotarFreteDoPadraoAction()).toEqual({
      tipo: "frete",
      frete: { tipo: "indisponivel" },
    });
  });

  it("sessão vencida na API vira sem-sessao", async () => {
    fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 401 }));

    expect(await cotarFreteDoPadraoAction()).toEqual({ tipo: "sem-sessao" });
  });

  describe("cotarFreteDoEnderecoAction", () => {
    it("sem sessão não chama a API", async () => {
      sessao.token = undefined;

      expect(await cotarFreteDoEnderecoAction(ID)).toEqual({ tipo: "sem-sessao" });
      expect(fetchFalso).not.toHaveBeenCalled();
    });

    it("id que não é UUID não chega à API", async () => {
      expect(await cotarFreteDoEnderecoAction("../x")).toEqual({
        tipo: "frete",
        frete: { tipo: "indisponivel" },
      });
      expect(fetchFalso).not.toHaveBeenCalled();
    });

    it("cota o endereço escolhido, mesmo que não seja o padrão, com o token", async () => {
      fetchFalso.mockResolvedValueOnce(json({ naArea: true, freteCentavos: 1850, gratis: false }));

      expect(await cotarFreteDoEnderecoAction(ID)).toEqual({
        tipo: "frete",
        frete: { tipo: "valor", centavos: 1850 },
      });
      const [url, opcoes] = fetchFalso.mock.calls[0]!;
      expect(url).toBe(`http://api.test/me/enderecos/${ID}/frete`);
      expect(opcoes.headers.Authorization).toBe("Bearer acesso-1");
    });

    it("fora da área, endereço que não existe (404) e erro da API", async () => {
      fetchFalso.mockResolvedValueOnce(json({ naArea: false }));
      expect(await cotarFreteDoEnderecoAction(ID)).toEqual({
        tipo: "frete",
        frete: { tipo: "fora-da-area" },
      });
      fetchFalso.mockResolvedValueOnce(json({}, 404));
      expect(await cotarFreteDoEnderecoAction(ID)).toEqual({
        tipo: "frete",
        frete: { tipo: "indisponivel" },
      });
      fetchFalso.mockRejectedValueOnce(new Error("rede"));
      expect(await cotarFreteDoEnderecoAction(ID)).toEqual({
        tipo: "frete",
        frete: { tipo: "indisponivel" },
      });
    });
  });
});
