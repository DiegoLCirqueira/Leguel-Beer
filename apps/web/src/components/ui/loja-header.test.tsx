import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LojaHeader } from "./loja-header";

describe("LojaHeader", () => {
  it("mostra o logo, que leva à home, e a Geladeira com o contador recebido", () => {
    render(<LojaHeader count={3} />);

    expect(screen.getByRole("link", { name: "Leguelé Beer, início" })).toHaveAttribute("href", "/");
    const geladeira = screen.getByRole("link", { name: "Geladeira, 3 unidades" });
    expect(geladeira).toHaveAttribute("href", "/geladeira");
    expect(geladeira).toHaveTextContent("3");
  });

  it("com a Geladeira vazia mostra 0, e com um item usa o singular", () => {
    const { rerender } = render(<LojaHeader count={0} />);
    expect(screen.getByRole("link", { name: "Geladeira, 0 unidades" })).toHaveTextContent("0");

    rerender(<LojaHeader count={1} />);

    expect(screen.getByRole("link", { name: "Geladeira, 1 unidade" })).toBeInTheDocument();
  });

  it("com `grande` (home) o logo é maior que o das outras telas da loja", () => {
    const { container, rerender } = render(<LojaHeader count={0} />);
    const normal = container.querySelector("img")!;
    expect(normal).toHaveClass("w-16");

    rerender(<LojaHeader count={0} grande />);

    expect(container.querySelector("img")).toHaveClass("w-28");
    expect(screen.getByRole("link", { name: "Leguelé Beer, início" })).toHaveAttribute("href", "/");
  });
});
