import { perfilResponseSchema } from "@leguele/shared";
import { describe, expect, it, vi } from "vitest";
import type { Sessao } from "./gotrue";
import { criarPerfilNoPrimeiroAcesso } from "./primeiro-acesso";

const sessao = (metadata: Record<string, unknown>): Sessao => ({
  accessToken: "acesso",
  refreshToken: "renovacao",
  user: { id: "u1", email: "ana@exemplo.com", metadata },
});

describe("criarPerfilNoPrimeiroAcesso", () => {
  it("envia à API o nome, o telefone e o aceite guardados no cadastro", async () => {
    const api = { request: vi.fn().mockResolvedValue({}) };

    const resultado = await criarPerfilNoPrimeiroAcesso(
      sessao({ nome: "Ana Souza", telefone: "82999990000", aceite: true }),
      { api },
    );

    expect(resultado).toBe("ok");
    expect(api.request).toHaveBeenCalledWith("/me/profile", {
      method: "POST",
      body: { nome: "Ana Souza", telefone: "82999990000", aceite: true },
      schema: perfilResponseSchema,
    });
  });

  it("não manda e-mail, id nem papel: vêm do token", async () => {
    const api = { request: vi.fn().mockResolvedValue({}) };

    await criarPerfilNoPrimeiroAcesso(
      sessao({
        nome: "Ana",
        telefone: "82999990000",
        aceite: true,
        papel: "admin",
        email: "x@y.com",
      }),
      { api },
    );

    expect(Object.keys(api.request.mock.calls[0]?.[1].body)).toEqual([
      "nome",
      "telefone",
      "aceite",
    ]);
  });

  it("conta sem os dados do cadastro (ex.: criada pelo seed) não chama a API", async () => {
    const api = { request: vi.fn() };

    expect(await criarPerfilNoPrimeiroAcesso(sessao({}), { api })).toBe("sem-dados");
    expect(api.request).not.toHaveBeenCalled();
  });

  it("falha da API não derruba a entrada: devolve erro para tentar de novo no próximo acesso", async () => {
    const api = { request: vi.fn().mockRejectedValue(new Error("API fora do ar")) };

    expect(
      await criarPerfilNoPrimeiroAcesso(
        sessao({ nome: "Ana", telefone: "82999990000", aceite: true }),
        { api },
      ),
    ).toBe("erro");
  });
});
