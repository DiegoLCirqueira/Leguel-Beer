import type { CervejaDetalhe } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProdutoConteudo } from "./produto-conteudo";

const cerveja = (extra: Partial<CervejaDetalhe> = {}): CervejaDetalhe => ({
  id: "1",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 12,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
  descricao: "Uma American IPA de respeito, com amargor marcante.",
  precoAnteriorCentavos: 3690,
  descontoPercentual: 13,
  ...extra,
});

describe("ProdutoConteudo", () => {
  it("mostra o nome, o estilo, o selo da categoria, a ficha, o preço com desconto e a descrição", () => {
    render(<ProdutoConteudo cerveja={cerveja()} />);

    expect(screen.getByRole("heading", { level: 1, name: "Maré Alta" })).toBeInTheDocument();
    expect(screen.getByText("American IPA")).toBeInTheDocument();
    expect(screen.getByText("IPAS")).toBeInTheDocument();
    const ficha = screen.getByRole("list", { name: "Ficha técnica" });
    expect(within(ficha).getByText("Teor alcoólico")).toBeInTheDocument();
    expect(within(ficha).getByText("6,5%")).toBeInTheDocument();
    expect(within(ficha).getByText("IBU")).toBeInTheDocument();
    expect(within(ficha).getByText("65")).toBeInTheDocument();
    expect(within(ficha).getByText("330 ml")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*32,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*36,90/)).toBeInTheDocument();
    expect(screen.getByText("-13%")).toBeInTheDocument();
    expect(
      screen.getByText("Uma American IPA de respeito, com amargor marcante."),
    ).toBeInTheDocument();
  });

  it("sem descrição a seção não aparece", () => {
    render(<ProdutoConteudo cerveja={cerveja({ descricao: null })} />);

    expect(
      screen.queryByRole("heading", { level: 2, name: "Sobre a cerveja" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    [3, "Últimas 3 unidades em estoque!"],
    [1, "Última unidade em estoque!"],
    [5, "Últimas 5 unidades em estoque!"],
  ])("com %i disponível(is) avisa: %s", (quantidadeDisponivel, aviso) => {
    render(<ProdutoConteudo cerveja={cerveja({ quantidadeDisponivel })} />);

    expect(screen.getByText(aviso)).toBeInTheDocument();
  });

  it("com 6 ou mais disponíveis não mostra o aviso de estoque", () => {
    render(<ProdutoConteudo cerveja={cerveja({ quantidadeDisponivel: 6 })} />);

    expect(screen.queryByText(/em estoque!/)).not.toBeInTheDocument();
  });

  it("mostra a linha informativa de frete grátis", () => {
    render(<ProdutoConteudo cerveja={cerveja()} />);

    expect(screen.getByText("Frete grátis em compras acima de R$ 150,00")).toBeInTheDocument();
  });

  it("o seletor vai de 1 até a quantidade disponível e o botão fixo fica desabilitado até a Geladeira existir", async () => {
    render(<ProdutoConteudo cerveja={cerveja({ quantidadeDisponivel: 2 })} />);

    const grupo = screen.getByRole("group", { name: "Quantidade de Maré Alta" });
    expect(grupo).toHaveTextContent("1");
    await userEvent.click(screen.getByRole("button", { name: "Aumentar quantidade" }));
    expect(grupo).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Aumentar quantidade" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    const botao = screen.getByRole("button", { name: "Adicionar à geladeira" });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAccessibleDescription("A Geladeira ainda não está disponível.");
  });

  it("esgotada mostra o selo Esgotado, sem seletor, com o botão desabilitado", () => {
    render(<ProdutoConteudo cerveja={cerveja({ esgotada: true, quantidadeDisponivel: 0 })} />);

    expect(screen.getByText("Esgotado")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: /Quantidade/ })).not.toBeInTheDocument();
    const botao = screen.getByRole("button", { name: "Adicionar à geladeira" });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAccessibleDescription("Cerveja esgotada.");
  });

  it("com imagem da cerveja descreve a garrafa; sem imagem a padrão é decorativa", () => {
    const { rerender } = render(
      <ProdutoConteudo cerveja={cerveja({ imagemUrl: "https://exemplo.test/mare.webp" })} />,
    );
    expect(screen.getByRole("img", { name: "Maré Alta, American IPA" })).toBeInTheDocument();

    rerender(<ProdutoConteudo cerveja={cerveja({ imagemUrl: null })} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
