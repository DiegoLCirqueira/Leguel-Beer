import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Termos from "./page";

describe("/termos", () => {
  it("mostra os Termos de Uso com as seis seções, a data e o rodapé", () => {
    render(<Termos />);

    expect(screen.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeInTheDocument();
    expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "1. Sobre este site.",
      "2. Maioridade.",
      "3. Conta.",
      "4. Uso permitido.",
      "5. Disponibilidade.",
      "6. Mudanças nestes termos.",
    ]);
    expect(
      screen.getByText(
        /A cervejaria, os produtos, os preços e os dados da empresa são fictícios\./,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/portfólio/i)).not.toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
