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

  it("com frete em valor, mostra o frete e soma ao total", () => {
    render(
      <TotaisDoResumo
        quantidadeTotal={3}
        subtotalCentavos={9600}
        frete={{ tipo: "valor", centavos: 1300 }}
      />,
    );

    expect(screen.getByText("R$ 13,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 109,00")).toBeInTheDocument();
    expect(
      screen.queryByText("Informe seu endereço para calcular o frete"),
    ).not.toBeInTheDocument();
  });

  it("com frete grátis, mostra Grátis e o total é o subtotal", () => {
    render(
      <TotaisDoResumo quantidadeTotal={5} subtotalCentavos={16000} frete={{ tipo: "gratis" }} />,
    );

    expect(screen.getByText("Grátis")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 160,00")).toHaveLength(2);
  });

  it("fora da área, avisa no lugar do frete e o total é o subtotal", () => {
    render(
      <TotaisDoResumo
        quantidadeTotal={3}
        subtotalCentavos={9600}
        frete={{ tipo: "fora-da-area" }}
      />,
    );

    expect(screen.getByText("Ainda não entregamos neste endereço")).toBeInTheDocument();
    expect(screen.getAllByText("R$ 96,00")).toHaveLength(2);
  });

  it("sem conseguir cotar, avisa e o total é o subtotal", () => {
    render(
      <TotaisDoResumo
        quantidadeTotal={3}
        subtotalCentavos={9600}
        frete={{ tipo: "indisponivel" }}
      />,
    );

    expect(
      screen.getByText("Não conseguimos calcular o frete agora. Tente de novo em instantes."),
    ).toBeInTheDocument();
    expect(screen.getAllByText("R$ 96,00")).toHaveLength(2);
  });
});
