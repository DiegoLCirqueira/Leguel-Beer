import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sessao = vi.hoisted(() => ({ token: "acesso-1" as string | undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (nome: string) =>
      nome === "lb_acesso" && sessao.token ? { value: sessao.token } : undefined,
  }),
}));
const consultar = vi.hoisted(() => vi.fn());
vi.mock("@/lib/enderecos/cep", () => ({ consultarCep: consultar }));
const revalidar = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidatePath: revalidar }));

const { tornarPadraoAction, excluirEnderecoAction, salvarEnderecoAction, buscarCepAction } =
  await import("./actions");

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

  it("UUID com texto antes ou depois também não chega à API", async () => {
    expect(await excluirEnderecoAction(`../x/${ID}`)).toEqual({ tipo: "erro" });
    expect(await tornarPadraoAction(`${ID}/../x`)).toEqual({ tipo: "erro" });
    expect(fetchFalso).not.toHaveBeenCalled();
  });

  describe("salvarEnderecoAction", () => {
    const form = {
      apelido: "Casa",
      cep: "57035-000",
      rua: "Avenida Fernandes Lima",
      numero: "100",
      complemento: "",
      bairro: "Farol",
      cidade: "Maceió",
      uf: "AL",
    };
    const erroDaApi = (status: number, code: string, message: string) =>
      new Response(JSON.stringify({ code, message }), { status });

    it("endereço novo: POST /me/enderecos com o corpo validado e atualiza a lista", async () => {
      fetchFalso.mockResolvedValue(new Response("{}", { status: 201 }));

      const resultado = await salvarEnderecoAction(form);

      const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("http://api.test/me/enderecos");
      expect(init.method).toBe("POST");
      expect(JSON.parse(init.body as string)).toEqual({
        apelido: "Casa",
        cep: "57035000",
        rua: "Avenida Fernandes Lima",
        numero: "100",
        bairro: "Farol",
        cidade: "Maceió",
        uf: "AL",
      });
      expect(resultado).toEqual({ tipo: "ok" });
      expect(revalidar).toHaveBeenCalledWith("/conta/enderecos");
    });

    it("edição: PUT /me/enderecos/:id", async () => {
      fetchFalso.mockResolvedValue(new Response("{}", { status: 200 }));

      await salvarEnderecoAction(form, ID);

      const [url, init] = fetchFalso.mock.calls[0] as [string, RequestInit];
      expect(url).toBe(`http://api.test/me/enderecos/${ID}`);
      expect(init.method).toBe("PUT");
    });

    it("dados inválidos voltam com a mensagem de cada campo e não chegam à API", async () => {
      const resultado = await salvarEnderecoAction({ ...form, rua: "", cep: "01432-000" });

      expect(resultado).toEqual({
        tipo: "invalido",
        erros: { rua: "Informe a rua.", cep: "Por enquanto só entregamos em Alagoas." },
      });
      expect(fetchFalso).not.toHaveBeenCalled();
    });

    it("endereço não localizado e mapas fora do ar mostram a mensagem da API", async () => {
      fetchFalso.mockResolvedValueOnce(
        erroDaApi(
          422,
          "ADDRESS_NOT_LOCATED",
          "Não encontramos este endereço. Confira a rua, o número e o CEP.",
        ),
      );
      expect(await salvarEnderecoAction(form)).toEqual({
        tipo: "erro",
        mensagem: "Não encontramos este endereço. Confira a rua, o número e o CEP.",
      });
      fetchFalso.mockResolvedValueOnce(
        erroDaApi(
          503,
          "MAPS_UNAVAILABLE",
          "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
        ),
      );
      expect(await salvarEnderecoAction(form)).toEqual({
        tipo: "erro",
        mensagem: "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
      });
      expect(revalidar).not.toHaveBeenCalled();
    });

    it("429, falha da rede e erro desconhecido mostram textos próprios, sem repassar a resposta", async () => {
      fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 429 }));
      expect(await salvarEnderecoAction(form)).toEqual({
        tipo: "erro",
        mensagem: "Muitas tentativas. Tente de novo em instantes.",
      });
      fetchFalso.mockRejectedValueOnce(new Error("rede"));
      expect(await salvarEnderecoAction(form)).toEqual({
        tipo: "erro",
        mensagem: "Não foi possível salvar agora. Tente de novo.",
      });
      fetchFalso.mockResolvedValueOnce(erroDaApi(500, "INTERNAL", "stack secreta"));
      expect(await salvarEnderecoAction(form)).toEqual({
        tipo: "erro",
        mensagem: "Não foi possível salvar agora. Tente de novo.",
      });
    });

    it("sem sessão e 401 viram sem-sessao", async () => {
      fetchFalso.mockResolvedValueOnce(new Response("{}", { status: 401 }));
      expect(await salvarEnderecoAction(form)).toEqual({ tipo: "sem-sessao" });
      sessao.token = undefined;
      expect(await salvarEnderecoAction(form)).toEqual({ tipo: "sem-sessao" });
    });

    it("id de edição que não é UUID não chega à API", async () => {
      expect(await salvarEnderecoAction(form, "../x")).toEqual({
        tipo: "erro",
        mensagem: "Não foi possível salvar agora. Tente de novo.",
      });
      expect(fetchFalso).not.toHaveBeenCalled();
    });
  });

  it("buscarCepAction repassa o CEP à consulta e devolve o resultado", async () => {
    consultar.mockResolvedValue({ tipo: "nao-encontrado" });

    expect(await buscarCepAction("57999-999")).toEqual({ tipo: "nao-encontrado" });
    expect(consultar).toHaveBeenCalledWith("57999-999");
  });

  it("buscarCepAction sem sessão não consulta o serviço", async () => {
    sessao.token = undefined;

    expect(await buscarCepAction("57035-000")).toEqual({ tipo: "indisponivel" });
    expect(consultar).not.toHaveBeenCalled();
  });
});
