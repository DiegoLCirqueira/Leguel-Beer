import type { EnderecoResposta } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { lerToken, buscar, redirecionar } = vi.hoisted(() => ({
  lerToken: vi.fn(),
  buscar: vi.fn(),
  redirecionar: vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
}));
vi.mock("@/lib/auth/servidor", () => ({ lerTokenDeAcesso: lerToken }));
vi.mock("@/lib/enderecos/buscar", () => ({ buscarEnderecos: buscar }));
vi.mock("next/navigation", () => ({ redirect: redirecionar }));

import MeusEnderecos from "./page";

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

describe("/conta/enderecos", () => {
  beforeEach(() => {
    lerToken.mockResolvedValue("token-1");
    buscar.mockResolvedValue({ tipo: "ok", enderecos: [casa] });
  });

  it("lista os endereços da conta com o título e o subtítulo", async () => {
    render(await MeusEnderecos());

    expect(screen.getByRole("heading", { level: 1, name: "Meus endereços" })).toBeInTheDocument();
    expect(screen.getByText("Gerencie seus endereços de entrega")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Casa" })).toBeInTheDocument();
    expect(buscar).toHaveBeenCalledWith("token-1");
  });

  it("sem endereço salvo, mostra 'Você ainda não tem endereço salvo.'", async () => {
    buscar.mockResolvedValue({ tipo: "ok", enderecos: [] });
    render(await MeusEnderecos());

    expect(screen.getByText("Você ainda não tem endereço salvo.")).toBeInTheDocument();
  });

  it("com a API fora do ar, mostra o erro e 'Tentar de novo' para /conta/enderecos", async () => {
    buscar.mockResolvedValue({ tipo: "erro" });
    render(await MeusEnderecos());

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar seus endereços agora.",
    );
    expect(screen.getByRole("link", { name: "Tentar de novo" })).toHaveAttribute(
      "href",
      "/conta/enderecos",
    );
  });

  it("sem sessão, manda para entrar e voltar para os endereços", async () => {
    lerToken.mockResolvedValue(undefined);

    await expect(MeusEnderecos()).rejects.toThrow("REDIRECT:/entrar?retorno=%2Fconta%2Fenderecos");
    expect(buscar).not.toHaveBeenCalled();
  });

  it("sessão recusada pela API também manda para entrar", async () => {
    buscar.mockResolvedValue({ tipo: "sem-sessao" });

    await expect(MeusEnderecos()).rejects.toThrow("REDIRECT:/entrar?retorno=%2Fconta%2Fenderecos");
  });
});
