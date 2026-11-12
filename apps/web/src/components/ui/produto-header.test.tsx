import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProdutoHeader } from "./produto-header";

describe("ProdutoHeader", () => {
  it("tem o botão Voltar e a Geladeira com o contador recebido", () => {
    render(<ProdutoHeader count={2} />);

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/catalogo");
    const geladeira = screen.getByRole("link", { name: "Geladeira, 2 unidades" });
    expect(geladeira).toHaveAttribute("href", "/geladeira");
    expect(geladeira).toHaveTextContent("2");
  });

  it("o destino do Voltar pode mudar e a Geladeira vazia mostra 0 itens, com 1 no singular", () => {
    const { rerender } = render(<ProdutoHeader count={0} voltarHref="/" />);
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Geladeira, 0 unidades" })).toBeInTheDocument();

    rerender(<ProdutoHeader count={1} />);

    expect(screen.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeInTheDocument();
  });

  describe("Voltar", () => {
    const origem = window.location.origin;
    const definir = (referrer: string, historico: number, carga?: string) => {
      Object.defineProperty(document, "referrer", { value: referrer, configurable: true });
      Object.defineProperty(window.history, "length", { value: historico, configurable: true });
      vi.spyOn(performance, "getEntriesByType").mockReturnValue(
        carga ? ([{ name: `${origem}${carga}` }] as unknown as PerformanceEntryList) : [],
      );
    };
    afterEach(() => {
      Object.defineProperty(document, "referrer", { value: "", configurable: true });
      window.history.pushState({}, "", "/");
      vi.restoreAllMocks();
    });

    it("depois de navegar no app (a página atual não é a da carga) volta pelo histórico", async () => {
      const voltar = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
      window.history.pushState({}, "", "/catalogo/mare-alta");
      definir("", 3, "/");
      render(<ProdutoHeader count={0} />);

      await userEvent.click(screen.getByRole("link", { name: "Voltar" }));

      expect(voltar).toHaveBeenCalledOnce();
    });

    it("aba nova (histórico de 1) cai no catálogo: o botão não fica morto", async () => {
      const voltar = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
      definir(`${origem}/`, 1);
      render(<ProdutoHeader count={0} />);

      const link = screen.getByRole("link", { name: "Voltar" });
      expect(link).toHaveAttribute("href", "/catalogo");
      await userEvent.click(link);

      expect(voltar).not.toHaveBeenCalled();
    });

    it("link direto, sem página anterior do site, segue o link para o catálogo", async () => {
      const voltar = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
      definir("", 4);
      render(<ProdutoHeader count={0} />);

      await userEvent.click(screen.getByRole("link", { name: "Voltar" }));

      expect(voltar).not.toHaveBeenCalled();
    });

    it("Ctrl ou Cmd e clique do meio deixam o navegador abrir o link, sem voltar na história", async () => {
      const voltar = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
      window.history.pushState({}, "", "/catalogo/mare-alta");
      definir("", 3, "/");
      render(<ProdutoHeader count={0} />);
      const link = screen.getByRole("link", { name: "Voltar" });

      fireEvent.click(link, { ctrlKey: true });
      fireEvent.click(link, { metaKey: true });
      fireEvent.click(link, { button: 1 });

      expect(voltar).not.toHaveBeenCalled();
    });
  });
});
