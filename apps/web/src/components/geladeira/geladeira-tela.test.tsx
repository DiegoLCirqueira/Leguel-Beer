import type { CervejaCard } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/geladeira" }));
import { CHAVE_DA_GELADEIRA } from "@/lib/geladeira/armazenamento";
import { GeladeiraProvider } from "./geladeira-provider";
import { GeladeiraTela } from "./geladeira-tela";

const mare: CervejaCard = {
  id: "mare",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: false,
  quantidadeDisponivel: 9,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
};

afterEach(() => localStorage.clear());

const guardar = (itens: { cerveja: CervejaCard; quantidade: number }[]) =>
  localStorage.setItem(CHAVE_DA_GELADEIRA, JSON.stringify({ versao: 1, itens }));

const abrir = () =>
  render(
    <GeladeiraProvider>
      <GeladeiraTela />
    </GeladeiraProvider>,
  );

describe("GeladeiraTela", () => {
  it("vazia, mostra as 4 prateleiras só com garrafas fantasma", () => {
    abrir();

    expect(screen.getByRole("heading", { level: 1, name: "Geladeira" })).toBeInTheDocument();
    for (const categoria of ["IPA", "Frutas", "Malt", "Lager"]) {
      const prateleira = screen.getByRole("region", { name: categoria });
      expect(
        within(prateleira).getAllByRole("link", { name: `Adicionar ${categoria}` }),
      ).toHaveLength(4);
    }
  });
});
