import type { CervejaCard } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const buscar = vi.hoisted(() => vi.fn());
vi.mock("@/lib/catalogo/destaques", () => ({ buscarDestaques: buscar }));

import { DestaquesServidor } from "./destaques-servidor";
import { DestaquesSkeleton } from "./destaques-skeleton";

const cerveja: CervejaCard = {
  id: "1",
  slug: "mare-alta",
  nome: "Maré Alta",
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
};

describe("DestaquesServidor", () => {
  beforeEach(() => buscar.mockReset());

  it("com a API respondendo mostra a seção de destaques", async () => {
    buscar.mockResolvedValue({ ok: true, itens: [cerveja] });

    render(await DestaquesServidor());

    expect(
      screen.getByRole("heading", { level: 2, name: "Cervejas em destaque" }),
    ).toBeInTheDocument();
  });

  it("se a API falha registra um aviso no log do servidor, sem dado de cliente", async () => {
    buscar.mockResolvedValue({ ok: false });
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(await DestaquesServidor());

    expect(aviso).toHaveBeenCalledOnce();
    expect(aviso).toHaveBeenCalledWith(
      "[destaques] não foi possível buscar os destaques da home; a seção foi omitida",
    );
    aviso.mockRestore();
  });

  it("se a API responde não registra aviso", async () => {
    buscar.mockResolvedValue({ ok: true, itens: [cerveja] });
    const aviso = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    render(await DestaquesServidor());

    expect(aviso).not.toHaveBeenCalled();
    aviso.mockRestore();
  });

  it("se a API falha não mostra nada e não quebra a home", async () => {
    buscar.mockResolvedValue({ ok: false });

    const { container } = render(await DestaquesServidor());

    expect(container).toBeEmptyDOMElement();
  });
});

describe("DestaquesSkeleton", () => {
  it("anuncia o carregamento e mostra blocos decorativos no lugar dos cards", () => {
    const { container } = render(<DestaquesSkeleton />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando os destaques");
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(4);
  });
});
