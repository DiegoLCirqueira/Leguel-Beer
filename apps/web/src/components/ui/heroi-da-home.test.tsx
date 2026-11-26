import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroiDaHome } from "./heroi-da-home";

describe("HeroiDaHome", () => {
  it("mostra o selo, o título, o texto de apoio e o botão que abre o catálogo sem filtros", () => {
    render(<HeroiDaHome />);

    expect(screen.getByText("Cervejas artesanais")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Sabor de verdade em cada gole!" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Cervejas artesanais feitas com os melhores ingredientes e muito mais sabor.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute("href", "/catalogo");
  });

  it("a arte é decorativa (alt vazio) e não entra na leitura", () => {
    const { container } = render(<HeroiDaHome />);

    const imagem = container.querySelector("img");
    expect(imagem).not.toBeNull();
    expect(imagem).toHaveAttribute("alt", "");
  });
});
