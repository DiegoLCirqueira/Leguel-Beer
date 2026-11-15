import type { CervejaCard } from "@leguele/shared";
import { render as renderRtl, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import { DestaquesDaHome } from "./destaques-da-home";

const render = (ui: React.ReactElement) => renderRtl(ui, { wrapper: GeladeiraProvider });

const cerveja = (id: string, nome: string, extra: Partial<CervejaCard> = {}): CervejaCard => ({
  id,
  slug: id,
  nome,
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 55,
  volumeMl: 500,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
  ...extra,
});

describe("DestaquesDaHome", () => {
  it("mostra a seção com título de nível 2, o link Ver todas e um card por destaque, na ordem recebida", () => {
    render(
      <DestaquesDaHome
        itens={[
          cerveja("1", "Maré Alta"),
          cerveja("2", "Porto IPA"),
          cerveja("3", "Cupuaçu Ale", { esgotada: true, quantidadeDisponivel: 0 }),
        ]}
      />,
    );

    const secao = screen.getByRole("region", { name: "Cervejas em destaque" });
    expect(secao).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Cervejas em destaque" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver todas" })).toHaveAttribute("href", "/catalogo");
    const nomes = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(nomes).toEqual(["Maré Alta", "Porto IPA", "Cupuaçu Ale"]);
    expect(screen.getByText("Esgotado")).toBeInTheDocument();
  });

  it("sem destaques a seção some: não renderiza nada", () => {
    const { container } = render(<DestaquesDaHome itens={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("'Adicionar' no card de destaque põe a cerveja na Geladeira e mostra o toast", async () => {
    render(<DestaquesDaHome itens={[cerveja("1", "Maré Alta")]} />);

    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("status")).toHaveTextContent("Maré Alta foi para a geladeira");
  });
});
