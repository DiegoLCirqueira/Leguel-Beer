import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import LojaLayout from "./layout";

describe("layout da loja", () => {
  it("põe o cabeçalho, o conteúdo, o rodapé e a barra inferior na mesma tela", () => {
    render(
      <LojaLayout>
        <main>Conteúdo da página</main>
      </LojaLayout>,
    );

    expect(screen.getByRole("link", { name: "Geladeira, 0 itens" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo da página");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Menu da loja" })).toBeInTheDocument();
  });
});
