import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const buscar = vi.hoisted(() => vi.fn());
vi.mock("@/lib/catalogo/buscar", () => ({ buscarCatalogo: buscar }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
import { FaixaDeCategoriasServidor } from "./faixa-de-categorias-servidor";

describe("FaixaDeCategoriasServidor", () => {
  beforeEach(() => buscar.mockReset());

  it("mostra as categorias com as contagens da API", async () => {
    buscar.mockResolvedValue({
      ok: true,
      dados: { itens: [], categorias: [{ slug: "ipa", nome: "IPAs", quantidade: 6 }] },
    });

    render(await FaixaDeCategoriasServidor());

    // A mesma consulta padrão do catálogo: as contagens são de todas as cervejas, sem filtro.
    expect(buscar).toHaveBeenCalledWith({ disponiveis: false, ordem: "relevancia" });
    expect(screen.getByRole("button", { name: "Todas (6)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IPAs (6)" })).toBeInTheDocument();
  });

  it("com a API fora do ar, a faixa some em silêncio", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    buscar.mockResolvedValue({ ok: false });

    const { container } = render(<>{await FaixaDeCategoriasServidor()}</>);

    expect(container).toBeEmptyDOMElement();
  });
});
