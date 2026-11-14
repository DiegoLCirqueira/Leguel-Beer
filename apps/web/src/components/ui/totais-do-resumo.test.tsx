import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TotaisDoResumo } from "./totais-do-resumo";

describe("TotaisDoResumo", () => {
  it("mostra o subtotal com o número de itens, o aviso de frete e o total igual ao subtotal", () => {
    render(<TotaisDoResumo quantidadeTotal={3} subtotalCentavos={9600} />);

    expect(screen.getByText("Subtotal (3 itens)")).toBeInTheDocument();
    expect(screen.getByText("Informe seu endereço para calcular o frete")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 96,00")).toHaveLength(2);
  });

  it("usa o singular com 1 item", () => {
    render(<TotaisDoResumo quantidadeTotal={1} subtotalCentavos={3200} />);

    expect(screen.getByText("Subtotal (1 item)")).toBeInTheDocument();
  });
});
