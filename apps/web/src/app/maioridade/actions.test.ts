import { beforeEach, describe, expect, it, vi } from "vitest";

const set = vi.fn();
const redirect = vi.fn();

vi.mock("next/headers", () => ({ cookies: async () => ({ set }) }));
vi.mock("next/navigation", () => ({ redirect }));

const { confirmarMaioridade } = await import("./actions");

const formulario = (retorno?: string) => {
  const dados = new FormData();
  if (retorno !== undefined) dados.set("retorno", retorno);
  return dados;
};

describe("confirmarMaioridade", () => {
  beforeEach(() => {
    set.mockClear();
    redirect.mockClear();
    vi.useFakeTimers({ now: Date.UTC(2026, 9, 30, 12) });
  });

  it("lembra a confirmação por 30 dias com a data de agora e vai para a página pedida", async () => {
    await confirmarMaioridade(formulario("/catalogo?categoria=ipa"));

    expect(set).toHaveBeenCalledWith(
      "leguele_maioridade",
      String(Date.UTC(2026, 9, 30, 12)),
      expect.objectContaining({ path: "/", maxAge: 30 * 24 * 60 * 60, httpOnly: true }),
    );
    expect(redirect).toHaveBeenCalledWith("/catalogo?categoria=ipa");
  });

  it("ignora o retorno de outro site e vai para a boas-vindas", async () => {
    await confirmarMaioridade(formulario("https://exemplo.com"));

    expect(redirect).toHaveBeenCalledWith("/boas-vindas");
  });

  it("sem retorno vai para a boas-vindas", async () => {
    await confirmarMaioridade(formulario());

    expect(redirect).toHaveBeenCalledWith("/boas-vindas");
  });
});
