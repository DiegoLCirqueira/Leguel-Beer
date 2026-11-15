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

    expect(screen.getByRole("link", { name: "Geladeira, 2 unidades" })).toBeInTheDocument();
    const barra = screen.getByRole("navigation", { name: "Menu da loja" });
    expect(within(barra).getByRole("link", { name: "Catálogo" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("mostra a moldura da Geladeira com 6 garrafas na IPA, 1 em Frutas e fantasmas nas outras", () => {
    render(<DevTokens />);

    const ipa = screen.getByRole("region", { name: "IPA" });
    expect(within(ipa).getByText(/^Maré Alta IPA, 6 unidades, R\$\s192,00$/)).toBeInTheDocument();
    const frutas = screen.getByRole("region", { name: "Frutas" });
    expect(within(frutas).getByText(/^Cupuaçu Ale, 1 unidade/)).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Malt" })).getAllByRole("link", {
        name: "Adicionar Malt",
      }),
    ).toHaveLength(4);
  });

  it("mostra o card de cerveja (disponível e esgotado) e o stepper, para conferir", async () => {
    render(<DevTokens />);

    expect(screen.getAllByRole("heading", { level: 3, name: "Maré Alta IPA" })).toHaveLength(1);
    expect(screen.getByText("Esgotado")).toBeInTheDocument();
    const grupo = screen.getByRole("group", { name: "Quantidade de exemplo" });
    expect(grupo).toHaveTextContent("1");
    await userEvent.click(within(grupo).getByRole("button", { name: "Aumentar quantidade" }));

    expect(grupo).toHaveTextContent("2");
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

  it("mostra o bloco de preço com desconto, o cabeçalho do produto, a barra fixa e o estado não encontrado", () => {
    render(<DevTokens />);

    expect(screen.getByText("-13%")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Geladeira, 3 unidades" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar à geladeira" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cerveja não encontrada" })).toBeInTheDocument();
  });

  it("em produção não existe", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() => DevTokens()).toThrow("NEXT_NOT_FOUND");
  });

  it("em produção só existe quando o E2E do CI liga VITRINE_E2E=1 (sem a variável continua 404)", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VITRINE_E2E", "1");

    render(<DevTokens />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Tokens e componentes" }),
    ).toBeInTheDocument();
  });
});
