import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaixaDaPrateleira } from "./faixa-da-prateleira";

describe("FaixaDaPrateleira", () => {
  it("prateleira vazia convida a escolher uma cerveja da categoria", () => {
    render(<FaixaDaPrateleira categoriaNome="Frutas" rotulos={[]} />);

    expect(screen.getByText("Toque no + para escolher uma Frutas")).toBeInTheDocument();
  });

  it("cada rótulo mostra o nome e ×N, e o leitor de tela lê nome, unidades e total", () => {
    render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré Alta", quantidade: 2, totalCentavos: 6400, coluna: 0 },
          {
            cervejaId: "b",
            nome: "Leguelé Carnaval",
            quantidade: 1,
            totalCentavos: 3200,
            coluna: 1,
          },
        ]}
      />,
    );

    expect(screen.getByText("×2")).toBeInTheDocument();
    expect(screen.getByText("×1")).toBeInTheDocument();
    expect(screen.getByText(/^Maré Alta, 2 unidades, R\$\s64,00$/)).toBeInTheDocument();
    expect(screen.getByText(/^Leguelé Carnaval, 1 unidade, R\$\s32,00$/)).toBeInTheDocument();
    expect(screen.queryByText(/Toque no \+/)).not.toBeInTheDocument();
  });

  it("cada cerveja ganha a própria placa em pílula, com o nome curto (sem o prefixo da marca) inteiro", () => {
    const { container } = render(
      <FaixaDaPrateleira
        categoriaNome="IPA"
        rotulos={[
          { cervejaId: "a", nome: "Maré Alta", quantidade: 2, totalCentavos: 6400, coluna: 0 },
          {
            cervejaId: "b",
            nome: "Leguelé Carnaval",
            quantidade: 4,
            totalCentavos: 12800,
            coluna: 2,
          },
        ]}
      />,
    );

    const placas = container.querySelectorAll("[data-placa]");
    expect(placas).toHaveLength(2);
    placas.forEach((placa) => expect(placa.className).toMatch(/rounded-full/));
    expect(screen.getByText("Carnaval")).toBeInTheDocument();
    expect(screen.queryByText("Leguelé Carnaval", { selector: "[aria-hidden]" })).toBeNull();
    expect(screen.getByText("Carnaval").className).not.toMatch(/truncate/);
  });

  it("o convite da prateleira vazia é uma pílula centralizada", () => {
    const { container } = render(<FaixaDaPrateleira categoriaNome="Malt" rotulos={[]} />);

    const placa = container.querySelector("[data-placa]");
    expect(placa).toHaveTextContent("Toque no + para escolher uma Malt");
    expect(placa?.className).toMatch(/rounded-full/);
    expect(placa?.className).toMatch(/justify-self-center/);
  });
});
