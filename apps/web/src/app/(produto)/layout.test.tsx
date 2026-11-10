import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProdutoLayout from "./layout";

describe("layout do produto", () => {
  it("tem o cabeçalho com Voltar e a Geladeira, sem a barra inferior da loja", () => {
    render(
      <ProdutoLayout>
        <main>Conteúdo</main>
      </ProdutoLayout>,
    );

    expect(screen.getByRole("link", { name: "Voltar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Geladeira, 0 itens" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo");
    expect(screen.queryByRole("navigation", { name: "Menu da loja" })).not.toBeInTheDocument();
  });

  it("publica a altura da barra fixa na variável CSS e reserva o espaço dela embaixo", () => {
    const { container } = render(
      <ProdutoLayout>
        <main>x</main>
      </ProdutoLayout>,
    );

    expect(container.firstElementChild).toHaveStyle("--altura-barra-loja: 80px");
  });
});
