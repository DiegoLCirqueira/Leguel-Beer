import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("Manter-me conectado começa marcado e a escolha vai para a tela de entrar", async () => {
    render(<WelcomeActions />);
    const checkbox = screen.getByRole("checkbox", { name: "Manter-me conectado" });
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar?manter-conectado=0");
  });

  it("o ícone (i) mostra e esconde a dica de Manter-me conectado", async () => {
    render(<WelcomeActions />);
    const info = screen.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" });
    expect(info).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(info);

    expect(info).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText("Sua sessão continua ativa neste aparelho por até 30 dias, mesmo depois de fechar o navegador."),
    ).toBeInTheDocument();

    await userEvent.click(info);

    expect(info).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Sua sessão continua ativa/)).not.toBeInTheDocument();
  });
});
