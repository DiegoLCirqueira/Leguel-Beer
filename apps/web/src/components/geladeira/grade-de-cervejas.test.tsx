import type { CervejaCard } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/catalogo" }));
import { CHAVE_DA_GELADEIRA } from "@/lib/geladeira/armazenamento";
import { GeladeiraProvider, useGeladeira } from "./geladeira-provider";
import { GradeDeCervejas } from "./grade-de-cervejas";

const cerveja = (id: string, nome: string, extra: Partial<CervejaCard> = {}): CervejaCard => ({
  id,
  slug: id,
  nome,
  estilo: "German Pilsner",
  categoria: { slug: "lager", nome: "Lager", ordem: 4 },
  teorAlcoolico: 4.7,
  ibu: 28,
  volumeMl: 500,
  precoCentavos: 2390,
  destaque: false,
  quantidadeDisponivel: 9,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
  ...extra,
});

afterEach(() => localStorage.clear());

const guardar = (itens: { cerveja: CervejaCard; quantidade: number }[]) =>
  localStorage.setItem(CHAVE_DA_GELADEIRA, JSON.stringify({ versao: 1, itens }));

function Contador() {
  const { quantidadeTotal } = useGeladeira();
  return <span data-testid="contador">{quantidadeTotal}</span>;
}

const abrir = (itens: CervejaCard[]) =>
  render(
    <GeladeiraProvider>
      <Contador />
      <GradeDeCervejas itens={itens} />
    </GeladeiraProvider>,
  );

describe("GradeDeCervejas", () => {
  it("'Adicionar' no card põe 1 unidade na Geladeira, com o toast e o 'Desfazer'", async () => {
    guardar([
      { cerveja: cerveja("a", "Maré Alta"), quantidade: 1 },
      { cerveja: cerveja("b", "Umbu Gose"), quantidade: 1 },
    ]);
    abrir([cerveja("pilsen", "Ponta Verde Pilsen")]);

    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("status")).toHaveTextContent("Ponta Verde Pilsen foi para a geladeira");
    expect(screen.getByRole("button", { name: "Desfazer" })).toBeInTheDocument();
    expect(screen.getByTestId("contador")).toHaveTextContent("3");
  });

  it("no limite da quantidade disponível mostra 'Só temos 2 unidades', sem 'Desfazer', e nada muda", async () => {
    const pilsen = cerveja("pilsen", "Ponta Verde Pilsen", { quantidadeDisponivel: 2 });
    guardar([{ cerveja: pilsen, quantidade: 2 }]);
    abrir([pilsen]);

    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("status")).toHaveTextContent("Só temos 2 unidades");
    expect(screen.queryByRole("button", { name: "Desfazer" })).not.toBeInTheDocument();
    expect(screen.getByTestId("contador")).toHaveTextContent("2");
  });

  it("'Desfazer' devolve a Geladeira e o contador ao que eram antes do toque", async () => {
    guardar([{ cerveja: cerveja("a", "Maré Alta"), quantidade: 2 }]);
    abrir([cerveja("pilsen", "Ponta Verde Pilsen")]);

    await userEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    expect(screen.getByTestId("contador")).toHaveTextContent("3");
    await userEvent.click(screen.getByRole("button", { name: "Desfazer" }));

    expect(screen.getByTestId("contador")).toHaveTextContent("2");
  });
});
