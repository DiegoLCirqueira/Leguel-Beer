import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Entregas from "./page";

describe("/entregas", () => {
  it("descreve a entrega como simulação, com área, frete e sem retirada", () => {
    render(<Entregas />);

    expect(screen.getByRole("heading", { level: 1, name: "Entregas" })).toBeInTheDocument();
    expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
    expect(screen.getByText("Só Maceió e região.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Calculado pela distância até a cervejaria, com frete grátis para pedidos acima de R$ 150.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Não há retirada no local.")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
