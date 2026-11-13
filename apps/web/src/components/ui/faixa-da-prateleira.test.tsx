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
          { cervejaId: "b", nome: "Leguelé Carnaval", quantidade: 1, totalCentavos: 3200, coluna: 1 },
        ]}
      />,
    );

    expect(screen.getByText("×2")).toBeInTheDocument();
    expect(screen.getByText("×1")).toBeInTheDocument();
    expect(screen.getByText(/^Maré Alta, 2 unidades, R\$\s64,00$/)).toBeInTheDocument();
    expect(screen.getByText(/^Leguelé Carnaval, 1 unidade, R\$\s32,00$/)).toBeInTheDocument();
    expect(screen.queryByText(/Toque no \+/)).not.toBeInTheDocument();
  });
});
