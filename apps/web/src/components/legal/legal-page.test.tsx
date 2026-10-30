import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LegalPage } from "./legal-page";

const secoes = [
  { titulo: "Primeira.", texto: "Texto da primeira." },
  { titulo: "Segunda.", texto: "Texto da segunda." },
];

describe("LegalPage", () => {
  it("mostra o título, a data da última atualização e as seções em ordem", () => {
    render(<LegalPage titulo="Termos de Uso" atualizadoEm="2026-10-30" secoes={secoes} />);

    expect(screen.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeInTheDocument();
    expect(screen.getByText(/Última atualização:/)).toHaveTextContent(
      "Última atualização: 30 de outubro de 2026",
    );
    const titulos = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(titulos).toEqual(["1. Primeira.", "2. Segunda."]);
    expect(screen.getByText("Texto da primeira.")).toBeInTheDocument();
    expect(screen.getByText("Texto da segunda.")).toBeInTheDocument();
  });

  it("marca a data com o elemento time", () => {
    const { container } = render(
      <LegalPage titulo="Entregas" atualizadoEm="2026-10-30" secoes={secoes} />,
    );

    expect(container.querySelector("time")).toHaveAttribute("datetime", "2026-10-30");
  });
});
