import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const empurrar = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: empurrar }) }));
import { FaixaDeCategorias } from "./faixa-de-categorias";

afterEach(() => empurrar.mockReset());

const categorias = [
  { slug: "ipa", nome: "IPAs", quantidade: 4 },
  { slug: "frutas", nome: "Frutas", quantidade: 4 },
  { slug: "malt", nome: "Malt", quantidade: 4 },
  { slug: "lager", nome: "Lager", quantidade: 4 },
];

describe("FaixaDeCategorias (home)", () => {
  it("mostra Todas primeiro, com o total, e cada categoria com a sua contagem", () => {
    render(<FaixaDeCategorias categorias={categorias} />);

    const botoes = screen.getAllByRole("button").map((b) => b.textContent);
    expect(botoes).toEqual(["Todas (16)", "IPAs (4)", "Frutas (4)", "Malt (4)", "Lager (4)"]);
  });

  it("tocar numa categoria abre o catálogo filtrado nela", async () => {
    render(<FaixaDeCategorias categorias={categorias} />);

    await userEvent.click(screen.getByRole("button", { name: "IPAs (4)" }));

    expect(empurrar).toHaveBeenCalledWith("/catalogo?categoria=ipa");
  });

  it("tocar em Todas abre o catálogo sem filtro", async () => {
    render(<FaixaDeCategorias categorias={categorias} />);

    await userEvent.click(screen.getByRole("button", { name: "Todas (16)" }));

    expect(empurrar).toHaveBeenCalledWith("/catalogo");
  });

  it("categoria sem cerveja ativa não aparece, e sem nenhuma a faixa some", () => {
    const { container, rerender } = render(
      <FaixaDeCategorias
        categorias={[...categorias, { slug: "stout", nome: "Stouts", quantidade: 0 }]}
      />,
    );
    expect(screen.queryByRole("button", { name: /Stouts/ })).not.toBeInTheDocument();

    rerender(<FaixaDeCategorias categorias={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
