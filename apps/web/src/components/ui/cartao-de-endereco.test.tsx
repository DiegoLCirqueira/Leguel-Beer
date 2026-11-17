import type { EnderecoResposta } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartaoDeEndereco } from "./cartao-de-endereco";

const casa: EnderecoResposta = {
  id: "e1",
  apelido: "Casa",
  cep: "57035000",
  rua: "Avenida Fernandes Lima",
  numero: "100",
  bairro: "Farol",
  cidade: "Maceió",
  uf: "AL",
  padrao: false,
  foraDaArea: false,
};

describe("CartaoDeEndereco", () => {
  it("mostra apelido, rua e número, bairro e cidade, e o CEP com máscara", () => {
    render(<CartaoDeEndereco endereco={casa} />);

    expect(screen.getByRole("heading", { name: "Casa" })).toBeInTheDocument();
    expect(screen.getByText("Avenida Fernandes Lima, 100")).toBeInTheDocument();
    expect(screen.getByText("Farol — Maceió/AL")).toBeInTheDocument();
    expect(screen.getByText("CEP 57035-000")).toBeInTheDocument();
  });

  it("sem apelido, o título é 'Endereço'", () => {
    render(<CartaoDeEndereco endereco={{ ...casa, apelido: undefined }} />);

    expect(screen.getByRole("heading", { name: "Endereço" })).toBeInTheDocument();
  });

  it("mostra o selo 'Padrão' só no endereço padrão", () => {
    const { rerender } = render(<CartaoDeEndereco endereco={casa} />);
    expect(screen.queryByText("Padrão")).not.toBeInTheDocument();

    rerender(<CartaoDeEndereco endereco={{ ...casa, padrao: true }} />);
    expect(screen.getByText("Padrão")).toBeInTheDocument();
  });

  it("mostra o selo 'Fora da área' só quando o endereço está fora da área", () => {
    const { rerender } = render(<CartaoDeEndereco endereco={casa} />);
    expect(screen.queryByText("Fora da área")).not.toBeInTheDocument();

    rerender(<CartaoDeEndereco endereco={{ ...casa, foraDaArea: true }} />);
    expect(screen.getByText("Fora da área")).toBeInTheDocument();
  });
});
