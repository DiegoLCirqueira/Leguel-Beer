import type { CatalogoQuery, CatalogoResponse, CervejaCard } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { CatalogoConteudo } from "./catalogo-conteudo";

const padrao: CatalogoQuery = { disponiveis: false, ordem: "relevancia" };

const cerveja = (id: string, nome: string, extra: Partial<CervejaCard> = {}): CervejaCard => ({
  id,
  slug: id,
  nome,
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPA", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: false,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
  ...extra,
});

const categorias = [
  { slug: "ipa", nome: "IPA", ordem: 1, quantidade: 6 },
  { slug: "frutas", nome: "Frutas", ordem: 2, quantidade: 4 },
];

const dados = (itens: CervejaCard[]): CatalogoResponse => ({
  itens,
  total: itens.length,
  categorias,
});

describe("CatalogoConteudo", () => {
  beforeEach(() => push.mockReset());

  it("mostra os chips com contador, a contagem de cervejas e um card por cerveja", () => {
    render(
      <CatalogoConteudo
        query={{ ...padrao, categoria: "ipa" }}
        dados={dados([cerveja("1", "Maré Alta IPA"), cerveja("2", "Porto IPA")])}
      />,
    );

    expect(screen.getByRole("button", { name: "Todas (10)" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "IPA (6)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Frutas (4)" })).toBeInTheDocument();
    expect(screen.getByText("2 cervejas")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Maré Alta IPA" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Porto IPA" })).toBeInTheDocument();
  });

  it("usa o singular com uma cerveja", () => {
    render(<CatalogoConteudo query={padrao} dados={dados([cerveja("1", "Maré Alta IPA")])} />);

    expect(screen.getByText("1 cerveja")).toBeInTheDocument();
  });

  it("tocar num chip põe a categoria na URL mantendo os outros filtros; Todas a tira", async () => {
    render(
      <CatalogoConteudo
        query={{ ...padrao, categoria: "ipa", teor: "6-ou-mais", ordem: "menor-preco" }}
        dados={dados([cerveja("1", "Maré Alta IPA")])}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Frutas (4)" }));
    expect(push).toHaveBeenLastCalledWith(
      "/catalogo?categoria=frutas&teor=6-ou-mais&ordem=menor-preco",
    );
    await userEvent.click(screen.getByRole("button", { name: "Todas (10)" }));

    expect(push).toHaveBeenLastCalledWith("/catalogo?teor=6-ou-mais&ordem=menor-preco");
  });

  it("sem resultado mostra o texto da spec e Limpar filtros, que volta ao catálogo inteiro", async () => {
    render(<CatalogoConteudo query={{ ...padrao, teor: "6-ou-mais" }} dados={dados([])} />);

    expect(screen.getByRole("heading", { level: 2, name: "0 cervejas" })).toBeInTheDocument();
    expect(screen.getByText("Nenhuma cerveja encontrada com esses filtros.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Limpar filtros" })).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(push).toHaveBeenCalledWith("/catalogo");
  });

  it("a contagem é um título de nível 2 antes da grade", () => {
    render(<CatalogoConteudo query={padrao} dados={dados([cerveja("1", "Maré Alta IPA")])} />);

    expect(screen.getByRole("heading", { level: 2, name: "1 cerveja" })).toBeInTheDocument();
  });

  it("com resultados e algum filtro ativo (até a categoria) mostra Limpar filtros ao lado da contagem", async () => {
    const { rerender } = render(
      <CatalogoConteudo
        query={{ ...padrao, categoria: "ipa" }}
        dados={dados([cerveja("1", "Maré Alta IPA")])}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(push).toHaveBeenCalledWith("/catalogo");

    rerender(<CatalogoConteudo query={padrao} dados={dados([cerveja("1", "Maré Alta IPA")])} />);

    expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
  });
});
