import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { tornarPadrao, excluir } = vi.hoisted(() => ({ tornarPadrao: vi.fn(), excluir: vi.fn() }));
vi.mock("@/app/(loja)/conta/enderecos/actions", () => ({
  tornarPadraoAction: tornarPadrao,
  excluirEnderecoAction: excluir,
}));

import { AcoesDoEndereco } from "./acoes-do-endereco";

describe("AcoesDoEndereco", () => {
  beforeEach(() => {
    tornarPadrao.mockReset().mockResolvedValue({ tipo: "ok" });
    excluir.mockReset().mockResolvedValue({ tipo: "ok" });
  });

  it("'Tornar padrão' chama a ação com o id do endereço", async () => {
    render(<AcoesDoEndereco id="e1" nome="Trabalho" padrao={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Tornar padrão: Trabalho" }));

    expect(tornarPadrao).toHaveBeenCalledWith("e1");
  });

  it("no endereço padrão não há 'Tornar padrão'", () => {
    render(<AcoesDoEndereco id="e1" nome="Casa" padrao />);

    expect(screen.queryByRole("button", { name: /Tornar padrão/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir: Casa" })).toBeInTheDocument();
  });

  it("'Excluir' chama a ação com o id do endereço", async () => {
    render(<AcoesDoEndereco id="e1" nome="Casa" padrao />);

    await userEvent.click(screen.getByRole("button", { name: "Excluir: Casa" }));

    expect(excluir).toHaveBeenCalledWith("e1");
  });

  it("se a ação falha, avisa e libera os botões para tentar de novo", async () => {
    excluir.mockResolvedValue({ tipo: "erro" });
    render(<AcoesDoEndereco id="e1" nome="Casa" padrao />);

    await userEvent.click(screen.getByRole("button", { name: "Excluir: Casa" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível concluir agora. Tente de novo.",
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Excluir: Casa" })).toBeEnabled());
  });

  it("endereço que já não existe pede para recarregar a lista", async () => {
    tornarPadrao.mockResolvedValue({ tipo: "nao-encontrado" });
    render(<AcoesDoEndereco id="e1" nome="Trabalho" padrao={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Tornar padrão: Trabalho" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Este endereço não existe mais.");
  });
});
