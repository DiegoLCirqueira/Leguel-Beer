import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import ProdutoLayout from "./layout";

describe("layout do produto", () => {
  it("tem o cabeçalho com Voltar e a Geladeira, sem a barra inferior da loja", () => {
    render(
      <GeladeiraProvider>
        <ProdutoLayout>
          <main>Conteúdo</main>
        </ProdutoLayout>
      </GeladeiraProvider>,
    );

    expect(screen.getByRole("link", { name: "Voltar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Geladeira, 0 unidades" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo");
    expect(screen.queryByRole("navigation", { name: "Menu da loja" })).not.toBeInTheDocument();
  });

  it("publica a altura da barra fixa na variável CSS e reserva o espaço dela embaixo", () => {
    const { container } = render(
      <GeladeiraProvider>
        <ProdutoLayout>
          <main>x</main>
        </ProdutoLayout>
      </GeladeiraProvider>,
    );

    expect(container.firstElementChild).toHaveStyle("--altura-barra-loja: 80px");
  });
});
