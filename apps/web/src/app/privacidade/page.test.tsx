import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Privacidade from "./page";

describe("/privacidade", () => {
  it("mostra a Política de Privacidade com as sete seções, o responsável e o contato", () => {
    render(<Privacidade />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Política de Privacidade" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Última atualização:/)).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(7);
    expect(
      screen.getByText(/Diego Lins Cirqueira, autor do projeto\..*diegopantanalstudio@gmail\.com/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Lei Geral de Proteção de Dados \(LGPD\)/)).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
