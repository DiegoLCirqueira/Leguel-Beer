import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProdutoHeader } from "./produto-header";

describe("ProdutoHeader", () => {
  it("tem o botão Voltar e a Geladeira com o contador recebido", () => {
    render(<ProdutoHeader count={2} />);

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/catalogo");
    const geladeira = screen.getByRole("link", { name: "Geladeira, 2 itens" });
    expect(geladeira).toHaveAttribute("href", "/geladeira");
    expect(geladeira).toHaveTextContent("2");
  });

  it("o destino do Voltar pode mudar e a Geladeira vazia mostra 0 itens, com 1 no singular", () => {
    const { rerender } = render(<ProdutoHeader count={0} voltarHref="/" />);
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Geladeira, 0 itens" })).toBeInTheDocument();

    rerender(<ProdutoHeader count={1} />);

    expect(screen.getByRole("link", { name: "Geladeira, 1 item" })).toBeInTheDocument();
  });

  describe("Voltar", () => {
    const definirReferrer = (valor: string) =>
      Object.defineProperty(document, "referrer", { value: valor, configurable: true });
    afterEach(() => {
      definirReferrer("");
      vi.restoreAllMocks();
    });

    it("volta pelo histórico quando a pessoa chegou de uma página do próprio site (ex.: a home)", async () => {
      const voltar = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
      definirReferrer(`${window.location.origin}/`);
      render(<ProdutoHeader count={0} />);

      await userEvent.click(screen.getByRole("link", { name: "Voltar" }));

      expect(voltar).toHaveBeenCalledOnce();
    });

    it("sem página anterior do site (link direto) segue o link de reserva para o catálogo", async () => {
      const voltar = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
      definirReferrer("https://outro-site.test/");
      render(<ProdutoHeader count={0} />);

      await userEvent.click(screen.getByRole("link", { name: "Voltar" }));

      expect(voltar).not.toHaveBeenCalled();
    });
  });
});
