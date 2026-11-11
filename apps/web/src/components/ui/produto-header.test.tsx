import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
