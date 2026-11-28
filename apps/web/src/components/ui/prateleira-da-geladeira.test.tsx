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
    expect(within(regiao).getAllByRole("button", { name: "Adicionar IPA" })).toHaveLength(4);
    expect(within(regiao).getByText("Toque no + para escolher uma IPA")).toBeInTheDocument();
  });

  it("2 unidades de um rótulo ocupam 2 posições e deixam 2 fantasmas, com a leitura do rótulo", () => {
    const { container } = render(
      <PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[mare(2)]} />,
    );

    expect(container.querySelectorAll("[data-garrafa]")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Adicionar IPA" })).toHaveLength(2);
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

  it("dois aumentos seguidos balançam de novo: a garrafa já animada reinicia a animação", () => {
    const { container, rerender } = render(
      <PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[mare(2)]} />,
    );
    rerender(<PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[mare(3)]} />);
    const primeira = container.querySelector("[data-garrafa] > div");

    rerender(<PrateleiraDaGeladeira indice={0} categoria={IPA} itens={[mare(4)]} />);

    const animacoes = [...container.querySelectorAll("[data-garrafa]")].map((g) =>
      g.getAttribute("data-animacao"),
    );
    expect(animacoes).toEqual(["balanco", "balanco", "balanco", "queda"]);
    expect(container.querySelector("[data-garrafa] > div")).not.toBe(primeira);
  });

  it("a luz dourada da prateleira e a sombra de contato de cada garrafa são decorativas (aria-hidden)", () => {
    const { container } = render(
      <PrateleiraDaGeladeira indice={1} categoria={IPA} itens={[mare(2)]} />,
    );

    const luz = container.querySelectorAll("[data-luz]");
    expect(luz).toHaveLength(1);
    expect(luz[0]).toHaveAttribute("aria-hidden", "true");
    const sombras = container.querySelectorAll("[data-garrafa] [data-sombra]");
    expect(sombras).toHaveLength(2);
    sombras.forEach((sombra) => expect(sombra).toHaveAttribute("aria-hidden", "true"));
  });

  it("cada garrafa tem um reflexo dourado suave no parapeito, decorativo", () => {
    const { container } = render(
      <PrateleiraDaGeladeira indice={1} categoria={IPA} itens={[mare(2)]} />,
    );

    const reflexos = container.querySelectorAll("[data-garrafa] [data-reflexo]");
    expect(reflexos).toHaveLength(2);
    reflexos.forEach((reflexo) => {
      expect(reflexo).toHaveAttribute("aria-hidden", "true");
      expect(reflexo.getAttribute("style")).toMatch(/radial-gradient/);
      expect(reflexo.getAttribute("style")).toMatch(/--color-aviso/);
    });
  });

  it("a sombra de contato usa gradiente radial, sem blur", () => {
    const { container } = render(
      <PrateleiraDaGeladeira indice={1} categoria={IPA} itens={[mare(1)]} />,
    );

    const sombra = container.querySelector("[data-garrafa] [data-sombra]");
    expect(sombra?.className).not.toMatch(/blur/);
    expect(sombra?.getAttribute("style")).toMatch(/radial-gradient/);
  });
});
