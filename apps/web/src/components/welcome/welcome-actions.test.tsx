import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WelcomeActions } from "./welcome-actions";

describe("WelcomeActions", () => {
  it("mostra os três caminhos como links de navegação", () => {
    render(<WelcomeActions />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar?manter-conectado=1");
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/criar-conta");
    expect(screen.getByRole("link", { name: "Continuar como convidado" })).toHaveAttribute("href", "/");
    expect(screen.getByText("ou")).toBeInTheDocument();
  });
});
