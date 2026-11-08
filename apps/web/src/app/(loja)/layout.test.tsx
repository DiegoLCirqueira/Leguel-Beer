import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import LojaLayout from "./layout";

describe("layout da loja", () => {
  it("põe o cabeçalho, o conteúdo e a barra inferior na mesma tela, sem rodapé", () => {
    render(
      <LojaLayout>
        <main>Conteúdo da página</main>
      </LojaLayout>,
    );

    expect(screen.getByRole("link", { name: "Geladeira, 0 itens" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo da página");
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu da loja" })).toBeInTheDocument();
  });

  it("publica a altura da barra inferior numa variável CSS para o que flutua acima dela", () => {
    const { container } = render(
      <LojaLayout>
        <main>x</main>
      </LojaLayout>,
    );

    expect(container.firstElementChild).toHaveStyle("--altura-barra-loja: 57px");
  });
});
