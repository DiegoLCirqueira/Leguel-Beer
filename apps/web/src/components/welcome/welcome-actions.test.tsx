import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WelcomeActions } from "./welcome-actions";

describe("WelcomeActions", () => {
  it("mostra os três caminhos como links de navegação", () => {
    render(<WelcomeActions />);

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/entrar?manter-conectado=1",
    );
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/criar-conta",
    );
    expect(screen.getByRole("link", { name: "Continuar como convidado" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText("ou")).toBeInTheDocument();
  });

  it("Manter-me conectado começa marcado e a escolha vai para a tela de entrar", async () => {
    render(<WelcomeActions />);
    const checkbox = screen.getByRole("checkbox", { name: "Manter-me conectado" });
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
      "href",
      "/entrar?manter-conectado=0",
    );
  });

  it("o ícone (i) mostra e esconde a dica de Manter-me conectado", async () => {
    render(<WelcomeActions />);
    const info = screen.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" });
    expect(info).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(info);

    expect(info).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByText(
        "Sua sessão continua ativa neste aparelho por até 30 dias, mesmo depois de fechar o navegador.",
      ),
    ).toBeInTheDocument();

    await userEvent.click(info);

    expect(info).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(/Sua sessão continua ativa/)).not.toBeInTheDocument();
  });

  it("Continuar como convidado guarda a escolha até fechar o navegador", async () => {
    render(<WelcomeActions />);

    await userEvent.click(screen.getByRole("link", { name: "Continuar como convidado" }));

    expect(document.cookie).toContain("leguele_convidado=1");
  });

  it("a dica do (i) fecha com Escape e devolve o foco ao ícone", async () => {
    render(<WelcomeActions />);
    const info = screen.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" });
    await userEvent.click(info);
    expect(screen.getByText(/Sua sessão continua ativa/)).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByText(/Sua sessão continua ativa/)).not.toBeInTheDocument();
    expect(info).toHaveFocus();
  });

  it("a dica do (i) fecha ao clicar fora dela", async () => {
    render(<WelcomeActions />);
    await userEvent.click(
      screen.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" }),
    );
    expect(screen.getByText(/Sua sessão continua ativa/)).toBeInTheDocument();

    await userEvent.click(document.body);

    expect(screen.queryByText(/Sua sessão continua ativa/)).not.toBeInTheDocument();
  });

  it("a dica do (i) fecha sozinha depois de 5 segundos", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      render(<WelcomeActions />);
      await userEvent.click(
        screen.getByRole("button", { name: "Saiba mais sobre Manter-me conectado" }),
      );
      expect(screen.getByText(/Sua sessão continua ativa/)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4900);
      });
      expect(screen.getByText(/Sua sessão continua ativa/)).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByText(/Sua sessão continua ativa/)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
