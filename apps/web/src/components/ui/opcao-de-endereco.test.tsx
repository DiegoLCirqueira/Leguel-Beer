import type { EnderecoResposta } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OpcaoDeEndereco } from "./opcao-de-endereco";

const endereco: EnderecoResposta = {
  id: "casa",
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

describe("OpcaoDeEndereco", () => {
  it("é um radio com o nome e o endereço, e avisa quando é escolhido", async () => {
    const aoEscolher = vi.fn();
    render(
      <OpcaoDeEndereco
        endereco={endereco}
        grupo="entrega"
        selecionado={false}
        aoEscolher={aoEscolher}
      />,
    );

    const opcao = screen.getByRole("radio", { name: /Casa/ });
    expect(opcao).not.toBeChecked();
    expect(screen.getByText("Avenida Fernandes Lima, 100")).toBeInTheDocument();
    expect(screen.getByText("Padrão")).toBeInTheDocument();
    await userEvent.click(opcao);
    expect(aoEscolher).toHaveBeenCalledWith("casa");
  });

  it("selecionado vem marcado e fora da área mostra o selo", () => {
    render(
      <OpcaoDeEndereco
        endereco={{ ...endereco, foraDaArea: true }}
        grupo="entrega"
        selecionado
        aoEscolher={() => {}}
      />,
    );

    expect(screen.getByRole("radio", { name: /Casa/ })).toBeChecked();
    expect(screen.getByText("Fora da área")).toBeInTheDocument();
  });
});
