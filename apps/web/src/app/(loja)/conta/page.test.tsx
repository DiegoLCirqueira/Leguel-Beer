import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Conta from "./page";

describe("/conta", () => {
  it("mostra o título e o botão Sair, que encerra a sessão", () => {
    render(<Conta />);

    expect(screen.getByRole("heading", { level: 1, name: "Minha conta" })).toBeInTheDocument();
    const sair = screen.getByRole("button", { name: "Sair" });
    expect(sair).toHaveAttribute("type", "submit");
    expect(sair.closest("form")).not.toBeNull();
  });

  it("termina com o rodapé do site", () => {
    render(<Conta />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
