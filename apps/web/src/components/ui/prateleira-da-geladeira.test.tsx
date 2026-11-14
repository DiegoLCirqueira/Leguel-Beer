import type { CervejaCard } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ItemLocal } from "@/lib/geladeira/estado";
import { posicaoDaGarrafa } from "@/lib/geladeira/geometria";
import { PrateleiraDaGeladeira } from "./prateleira-da-geladeira";

const IPA = { slug: "ipa", nome: "IPA" };

const cerveja = (id: string, nome: string, precoCentavos: number): CervejaCard => ({
  id,
  slug: id,
  nome,
  estilo: "American IPA",
  categoria: { ...IPA, ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 60,
  volumeMl: 500,
  precoCentavos,
  destaque: false,
  quantidadeDisponivel: 20,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
});

const mare = (quantidade: number): ItemLocal => ({
  cerveja: cerveja("mare", "Maré Alta", 3200),
  quantidade,
});

describe("PrateleiraDaGeladeira", () => {
  it("é uma região com o nome da categoria; vazia, tem 4 garrafas fantasma e o convite", () => {
    render(<PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[]} />);

    const regiao = screen.getByRole("region", { name: "IPA" });
    expect(within(regiao).getAllByRole("link", { name: "Adicionar IPA" })).toHaveLength(4);
    expect(within(regiao).getByText("Toque no + para escolher uma IPA")).toBeInTheDocument();
  });

  it("2 unidades de um rótulo ocupam 2 posições e deixam 2 fantasmas, com a leitura do rótulo", () => {
    const { container } = render(
      <PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[mare(2)]} />,
    );

    expect(container.querySelectorAll("[data-garrafa]")).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Adicionar IPA" })).toHaveLength(2);
    expect(screen.getByText(/^Maré Alta, 2 unidades, R\$\s64,00$/)).toBeInTheDocument();
  });

  it("6 unidades: 4 garrafas na frente, lado a lado, e 2 na fileira de trás, atrás da 1ª e da 2ª", () => {
    const indice = 2;
    const { container } = render(
      <PrateleiraDaGeladeira indice={indice} categoria={IPA} itens={[mare(6)]} />,
    );

    const colunaEFileira = [
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0],
      [0, 1],
      [1, 1],
    ];
    const garrafas = Array.from(container.querySelectorAll<HTMLElement>("[data-garrafa]"));
    expect(garrafas.map((g) => [g.style.left, g.style.bottom, g.style.height])).toEqual(
      colunaEFileira.map(([coluna, fileira]) => {
        const p = posicaoDaGarrafa(indice, coluna!, fileira!);
        return [`${p.left}%`, `${p.bottom}%`, `${p.height}%`];
      }),
    );
    expect(new Set(garrafas.slice(0, 4).map((g) => g.style.left)).size).toBe(4);
  });

  it("a unidade que entra cai e as do mesmo rótulo balançam; ao sair, a garrafa sai animada", () => {
    const { container, rerender } = render(
      <PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[mare(2)]} />,
    );
    const animacoes = () =>
      [...container.querySelectorAll("[data-garrafa]")].map((g) => g.getAttribute("data-animacao"));
    expect(animacoes()).toEqual([null, null]);

    rerender(<PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[mare(3)]} />);
    expect(animacoes()).toEqual(["balanco", "balanco", "queda"]);

    rerender(<PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[]} />);
    expect(animacoes()).toEqual(["saida", "saida", "saida"]);
  });
});
