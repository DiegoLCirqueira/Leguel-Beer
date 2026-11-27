import type { CervejaCard } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListaDeAdicionar } from "./lista-de-adicionar";

const cerveja = (id: string, nome: string, slug: string, extra: Partial<CervejaCard> = {}) =>
  ({
    id,
    slug: id,
    nome,
    estilo: "Fruit Ale",
    categoria: { slug, nome: slug, ordem: 1 },
    teorAlcoolico: 5,
    ibu: 20,
    volumeMl: 500,
    precoCentavos: 2650,
    destaque: false,
    quantidadeDisponivel: 9,
    esgotada: false,
    imagemUrl: null,
    cadastradaEm: "2026-10-01T10:00:00.000Z",
    ...extra,
  }) satisfies CervejaCard;

const cupuacu = cerveja("cupuacu", "Cupuaçu Ale", "frutas");
const graviola = cerveja("graviola", "Graviola Witbier", "frutas", {
  esgotada: true,
  quantidadeDisponivel: 0,
});
const mare = cerveja("mare", "Maré Alta IPA", "ipa");
const frutas = { slug: "frutas", nome: "Frutas" };

const abrir = (extra: Partial<React.ComponentProps<typeof ListaDeAdicionar>> = {}) => {
  const props = { aoFechar: vi.fn(), aoAdicionar: vi.fn() };
  render(
    <ListaDeAdicionar
      categoria={frutas}
      cervejas={[cupuacu, graviola, mare]}
      {...props}
      {...extra}
    />,
  );
  return props;
};

describe("ListaDeAdicionar", () => {
  it("é um diálogo 'Adicionar <categoria>' só com as cervejas daquela categoria, com nome e preço", () => {
    abrir();

    const dialogo = screen.getByRole("dialog", { name: "Adicionar Frutas" });
    expect(within(dialogo).getByText("Cupuaçu Ale")).toBeInTheDocument();
    expect(within(dialogo).getByText("Graviola Witbier")).toBeInTheDocument();
    expect(within(dialogo).getAllByText("R$ 26,50").length).toBeGreaterThan(0);
    expect(within(dialogo).queryByText("Maré Alta IPA")).not.toBeInTheDocument();
  });

  it("ao abrir, o foco vai para o título do diálogo (não para o primeiro Adicionar)", () => {
    abrir();

    expect(screen.getByRole("heading", { name: "Adicionar Frutas" })).toHaveFocus();
  });

  it("a miniatura da garrafa é decorativa (alt vazio)", () => {
    abrir();

    const dialogo = screen.getByRole("dialog", { name: "Adicionar Frutas" });
    expect(within(dialogo).queryByRole("img")).not.toBeInTheDocument();
  });

  it("Adicionar entrega a cerveja escolhida; a esgotada tem o selo e o botão desabilitado", async () => {
    const { aoAdicionar } = abrir();
    const dialogo = screen.getByRole("dialog", { name: "Adicionar Frutas" });
    const linhas = within(dialogo).getAllByRole("listitem");

    await userEvent.click(within(linhas[0]!).getByRole("button", { name: "Adicionar" }));

    expect(aoAdicionar).toHaveBeenCalledWith(cupuacu);
    expect(within(linhas[1]!).getByText("Esgotado")).toBeInTheDocument();
    expect(within(linhas[1]!).getByRole("button", { name: "Adicionar" })).toBeDisabled();
  });

  it("sem categoria escolhida não mostra nada; sem cervejas na categoria, avisa", () => {
    const { rerender } = render(
      <ListaDeAdicionar
        categoria={null}
        cervejas={[cupuacu]}
        aoFechar={vi.fn()}
        aoAdicionar={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    rerender(
      <ListaDeAdicionar
        categoria={{ slug: "malt", nome: "Malt" }}
        cervejas={[cupuacu]}
        aoFechar={vi.fn()}
        aoAdicionar={vi.fn()}
      />,
    );
    expect(screen.getByText("Nenhuma cerveja de Malt disponível agora.")).toBeInTheDocument();
  });

  it("Esc fecha a lista", async () => {
    const { aoFechar } = abrir();

    await userEvent.keyboard("{Escape}");

    expect(aoFechar).toHaveBeenCalled();
  });
});
