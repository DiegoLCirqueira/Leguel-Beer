import type { CervejaCard } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ItemLocal } from "@/lib/geladeira/estado";
import { MolduraDaGeladeira } from "./moldura-da-geladeira";

const cerveja = (id: string, nome: string, slug: string, ordem: number): CervejaCard => ({
  id,
  slug: id,
  nome,
  estilo: "Estilo",
  categoria: { slug, nome: slug, ordem },
  teorAlcoolico: 5,
  ibu: 20,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: false,
  quantidadeDisponivel: 20,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
});

describe("MolduraDaGeladeira", () => {
  it("tem uma prateleira por categoria, de cima para baixo: IPA, Frutas, Malt e Lager", () => {
    render(<MolduraDaGeladeira itens={[]} />);

    const nomes = screen.getAllByRole("region").map((r) => r.getAttribute("aria-label"));
    expect(nomes).toEqual(["IPA", "Frutas", "Malt", "Lager"]);
  });

  it("põe cada cerveja na prateleira da sua categoria; as outras ficam vazias", () => {
    const itens: ItemLocal[] = [
      { cerveja: cerveja("cupuacu", "Cupuaçu Ale", "frutas", 2), quantidade: 3 },
    ];
    render(<MolduraDaGeladeira itens={itens} />);

    const frutas = screen.getByRole("region", { name: "Frutas" });
    expect(within(frutas).getByText(/^Cupuaçu Ale, 3 unidades/)).toBeInTheDocument();
    expect(within(frutas).getAllByRole("button", { name: "Adicionar Frutas" })).toHaveLength(1);
    const lager = screen.getByRole("region", { name: "Lager" });
    expect(within(lager).getAllByRole("button", { name: "Adicionar Lager" })).toHaveLength(4);
  });

  it("mostra 'Leguelé Beer' na base da moldura, como texto decorativo que o leitor de tela ignora", () => {
    render(<MolduraDaGeladeira itens={[]} />);

    const nome = screen.getByText("Leguelé Beer");
    expect(nome).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("link", { name: /Leguelé Beer/ })).not.toBeInTheDocument();
  });
});
