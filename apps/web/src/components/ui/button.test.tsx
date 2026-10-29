import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("dispara a ação ao tocar", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Entrar</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("em carregamento fica desabilitado, com aria-busy, e não dispara a ação", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Entrar
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Entrar" });

    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("troca o ícone esquerdo pelo indicador de carregamento", () => {
    render(
      <Button loading iconLeft={<svg data-testid="icone" />}>
        Entrar
      </Button>,
    );

    expect(screen.queryByTestId("icone")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { hidden: true })).toBeInTheDocument();
  });

  it("não marca aria-busy fora do carregamento", () => {
    render(<Button>Entrar</Button>);

    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
  });
});
