import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BlocoDePreco } from "./bloco-de-preco";

describe("BlocoDePreco", () => {
  it("com desconto mostra o preço atual, o anterior riscado e o selo com o percentual", () => {
    const { container } = render(
      <BlocoDePreco precoCentavos={3200} precoAnteriorCentavos={3690} descontoPercentual={13} />,
    );

    expect(screen.getByText(/R\$\s*32,00/)).toBeInTheDocument();
    const riscado = container.querySelector("s, del");
    expect(riscado).toHaveTextContent(/R\$\s*36,90/);
    expect(screen.getByText("-13%")).toBeInTheDocument();
  });

  it("sem desconto só mostra o preço atual, mesmo que haja preço anterior igual ou menor", () => {
    const { container, rerender } = render(
      <BlocoDePreco precoCentavos={3200} precoAnteriorCentavos={null} descontoPercentual={null} />,
    );
    expect(screen.getByText(/R\$\s*32,00/)).toBeInTheDocument();
    expect(container.querySelector("s, del")).toBeNull();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();

    rerender(
      <BlocoDePreco precoCentavos={3200} precoAnteriorCentavos={3200} descontoPercentual={null} />,
    );

    expect(container.querySelector("s, del")).toBeNull();
  });
});
