import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  usePathname: () => "/catalogo",
}));

import DevTokens from "./page";

describe("/dev/tokens", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("em desenvolvimento mostra a vitrine dos componentes", () => {
    render(<DevTokens />);

    expect(screen.getByRole("button", { name: "Todas (16)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("mostra o Campo de digitar com contorno, para conferir a borda e o foco", () => {
    render(<DevTokens />);

    expect(screen.getByLabelText("Senha de exemplo")).toBeInTheDocument();
  });

  it("mostra o cabeçalho e a barra inferior da loja, para conferir o contador e a aba atual", () => {
    render(<DevTokens />);

    expect(screen.getByRole("link", { name: "Geladeira, 2 itens" })).toBeInTheDocument();
    const barra = screen.getByRole("navigation", { name: "Menu da loja" });
    expect(within(barra).getByRole("link", { name: "Catálogo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("abre o bottom sheet e o toast de exemplo e mostra um skeleton, para conferir cada um", async () => {
    render(<DevTokens />);

    await userEvent.click(screen.getByRole("button", { name: "Abrir bottom sheet" }));
    expect(screen.getByRole("dialog", { name: "Filtros e ordenação" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Mostrar toast" }));

    expect(
      screen.getByText("Munich Lager foi para a geladeira").closest('[role="status"]'),
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: "Desfazer" })).toBeInTheDocument();
    expect(screen.getByTestId("exemplo-skeleton")).toBeInTheDocument();
  });

  it("em produção não existe", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() => DevTokens()).toThrow("NEXT_NOT_FOUND");
  });
});
