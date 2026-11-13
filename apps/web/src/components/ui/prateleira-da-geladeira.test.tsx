import type { CervejaCard } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ItemLocal } from "@/lib/geladeira/estado";
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
});
