import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImagemDaGarrafa } from "./imagem-da-garrafa";

describe("ImagemDaGarrafa", () => {
  it("com foto, mostra a foto da cerveja como imagem decorativa (o nome está na faixa)", () => {
    const { container } = render(
      <ImagemDaGarrafa imagemUrl="/cervejas/mare-alta.webp" categoriaSlug="ipa" />,
    );

    const imagem = container.querySelector("img");
    expect(imagem).not.toBeNull();
    expect(imagem?.getAttribute("src")).toContain("mare-alta.webp");
    expect(imagem).toHaveAttribute("alt", "");
  });

  it("sem foto, desenha a garrafa sem rótulo na cor do selo da categoria", () => {
    const { container } = render(<ImagemDaGarrafa imagemUrl={null} categoriaSlug="frutas" />);

    expect(container.querySelector("img")).toBeNull();
    const garrafa = container.querySelector("svg");
    expect(garrafa).toHaveAttribute("aria-hidden", "true");
    expect(garrafa?.querySelector("path")).toHaveAttribute("fill", "var(--color-badge-frutas)");
  });
});
