import type { CervejaCard } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CardCerveja } from "./card-cerveja";

const cerveja = (extra: Partial<CervejaCard> = {}): CervejaCard => ({
  id: "1",
  slug: "mare-alta-ipa",
  nome: "Maré Alta IPA",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPA", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 12,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
  ...extra,
});

describe("CardCerveja", () => {
  it("mostra a categoria, o nome, o estilo com teor e volume e o preço em reais", () => {
    render(<CardCerveja cerveja={cerveja()} />);

    expect(screen.getByRole("heading", { level: 3, name: "Maré Alta IPA" })).toBeInTheDocument();
    expect(screen.getByText("IPA")).toBeInTheDocument();
    expect(screen.getByText("American IPA • 6,5% • 500ml")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*32,00/)).toBeInTheDocument();
  });

  it("formata o teor com uma casa decimal, mesmo quando é inteiro", () => {
    render(<CardCerveja cerveja={cerveja({ teorAlcoolico: 5, volumeMl: 355 })} />);

    expect(screen.getByText("American IPA • 5,0% • 355ml")).toBeInTheDocument();
  });

  it("com imagem da cerveja descreve a garrafa; sem imagem usa a imagem padrão, decorativa", () => {
    const { rerender } = render(
      <CardCerveja cerveja={cerveja({ imagemUrl: "https://exemplo.test/mare.webp" })} />,
    );
    expect(screen.getByRole("img", { name: "Maré Alta IPA, American IPA" })).toBeInTheDocument();

    rerender(<CardCerveja cerveja={cerveja({ imagemUrl: null })} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("sem ação de adicionar o botão fica desabilitado, com o motivo para leitores de tela", () => {
    render(<CardCerveja cerveja={cerveja()} />);

    const botao = screen.getByRole("button", { name: "Adicionar" });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAccessibleDescription("A Geladeira ainda não está disponível.");
  });

  it("com a ação de adicionar o botão fica habilitado e a dispara ao tocar", async () => {
    const aoAdicionar = vi.fn();
    render(<CardCerveja cerveja={cerveja()} aoAdicionar={aoAdicionar} />);

    const botao = screen.getByRole("button", { name: "Adicionar" });
    await userEvent.click(botao);

    expect(botao).toBeEnabled();
    expect(aoAdicionar).toHaveBeenCalledOnce();
  });

  it("esgotada mostra o selo Esgotado e o Adicionar desabilitado, mesmo com ação de adicionar", () => {
    const aoAdicionar = vi.fn();
    render(
      <CardCerveja
        cerveja={cerveja({ esgotada: true, quantidadeDisponivel: 0 })}
        aoAdicionar={aoAdicionar}
      />,
    );

    expect(screen.getByText("Esgotado")).toBeInTheDocument();
    const botao = screen.getByRole("button", { name: "Adicionar" });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAccessibleDescription("Cerveja esgotada.");
  });

  it("disponível não mostra o selo Esgotado", () => {
    render(<CardCerveja cerveja={cerveja()} aoAdicionar={vi.fn()} />);

    expect(screen.queryByText("Esgotado")).not.toBeInTheDocument();
  });
});
