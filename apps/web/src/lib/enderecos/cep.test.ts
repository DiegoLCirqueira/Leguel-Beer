import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { consultarCep } from "./cep";

const viacep = {
  cep: "57035-000",
  logradouro: "Avenida Fernandes Lima",
  bairro: "Farol",
  localidade: "Maceió",
  uf: "AL",
};
const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });

describe("consultarCep", () => {
  const fetchFalso = vi.fn();
  beforeEach(() => vi.stubGlobal("fetch", fetchFalso));
  afterEach(() => {
    fetchFalso.mockReset();
    vi.unstubAllGlobals();
  });

  it("CEP de Alagoas devolve rua, bairro, cidade e UF, pedindo só o CEP ao serviço", async () => {
    fetchFalso.mockResolvedValue(json(viacep));

    const resultado = await consultarCep("57035-000");

    expect(fetchFalso.mock.calls[0]?.[0]).toBe("https://viacep.com.br/ws/57035000/json/");
    expect(resultado).toEqual({
      tipo: "ok",
      rua: "Avenida Fernandes Lima",
      bairro: "Farol",
      cidade: "Maceió",
      uf: "AL",
    });
  });

  it("CEP inexistente ({ erro: true }) vira nao-encontrado", async () => {
    fetchFalso.mockResolvedValue(json({ erro: true }));

    expect(await consultarCep("57999-999")).toEqual({ tipo: "nao-encontrado" });
  });

  it("CEP fora da faixa 57 vira fora-de-alagoas sem chamar o serviço", async () => {
    expect(await consultarCep("01432-000")).toEqual({ tipo: "fora-de-alagoas" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  it("serviço que devolve outra UF vira fora-de-alagoas", async () => {
    fetchFalso.mockResolvedValue(json({ ...viacep, uf: "PE" }));

    expect(await consultarCep("57035-000")).toEqual({ tipo: "fora-de-alagoas" });
  });

  it("serviço fora do ar, lento ou com corpo estranho vira indisponivel", async () => {
    fetchFalso.mockResolvedValueOnce(json({}, 500));
    expect(await consultarCep("57035-000")).toEqual({ tipo: "indisponivel" });
    fetchFalso.mockRejectedValueOnce(new Error("rede"));
    expect(await consultarCep("57035-000")).toEqual({ tipo: "indisponivel" });
    fetchFalso.mockResolvedValueOnce(json("lixo"));
    expect(await consultarCep("57035-000")).toEqual({ tipo: "indisponivel" });
  });

  it("CEP que não tem 8 dígitos não chega ao serviço", async () => {
    expect(await consultarCep("570")).toEqual({ tipo: "invalido" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });
});
