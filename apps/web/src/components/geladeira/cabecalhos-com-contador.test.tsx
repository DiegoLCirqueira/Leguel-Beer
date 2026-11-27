import type { CervejaCard } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const caminho = vi.hoisted(() => ({ atual: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => caminho.atual }));
import { LojaHeaderComContador, ProdutoHeaderComContador } from "./cabecalhos-com-contador";
import { GeladeiraProvider, useGeladeira } from "./geladeira-provider";

const cerveja: CervejaCard = {
  id: "a",
  slug: "a",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: false,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
};

function Adicionar() {
  const g = useGeladeira();
  return (
    <button type="button" onClick={() => g.adicionar(cerveja, 2)}>
      adicionar duas
    </button>
  );
}

describe("cabeçalhos com o contador real da Geladeira", () => {
  afterEach(() => localStorage.clear());

  it("o cabeçalho da loja mostra a soma das unidades depois de ler a cópia local", async () => {
    render(
      <GeladeiraProvider>
        <LojaHeaderComContador />
        <Adicionar />
      </GeladeiraProvider>,
    );

    expect(await screen.findByRole("link", { name: "Geladeira, 0 unidades" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "adicionar duas" }));

    expect(screen.getByRole("link", { name: "Geladeira, 2 unidades" })).toHaveTextContent("2");
  });

  it("o cabeçalho do produto lê o mesmo contador", async () => {
    render(
      <GeladeiraProvider>
        <ProdutoHeaderComContador />
        <Adicionar />
      </GeladeiraProvider>,
    );

    await userEvent.click(await screen.findByRole("button", { name: "adicionar duas" }));

    expect(screen.getByRole("link", { name: "Geladeira, 2 unidades" })).toBeInTheDocument();
  });

  it("só na home o logo do cabeçalho da loja é maior", () => {
    caminho.atual = "/";
    const { container, unmount } = render(
      <GeladeiraProvider>
        <LojaHeaderComContador />
      </GeladeiraProvider>,
    );
    expect(container.querySelector("img")).toHaveClass("w-28");
    unmount();

    caminho.atual = "/catalogo";
    const outra = render(
      <GeladeiraProvider>
        <LojaHeaderComContador />
      </GeladeiraProvider>,
    );

    expect(outra.container.querySelector("img")).toHaveClass("w-16");
  });
});
