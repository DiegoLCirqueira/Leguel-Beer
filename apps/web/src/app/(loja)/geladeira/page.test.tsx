import { beforeEach, describe, expect, it, vi } from "vitest";

const { buscar, tela } = vi.hoisted(() => ({ buscar: vi.fn(), tela: vi.fn() }));
vi.mock("@/lib/catalogo/buscar", () => ({ buscarCatalogo: buscar }));
vi.mock("@/app/geladeira/frete", () => ({ cotarFreteDoPadraoAction: vi.fn() }));
vi.mock("@/components/geladeira/geladeira-tela", () => ({
  GeladeiraTela: (props: unknown) => {
    tela(props);
    return null;
  },
}));

import Geladeira from "./page";

describe("/geladeira", () => {
  beforeEach(() => {
    buscar.mockReset();
    tela.mockReset();
  });

  it("entrega à tela o catálogo na ordem de relevância, para a lista de adicionar", async () => {
    const itens = [{ id: "cupuacu" }];
    buscar.mockResolvedValue({ ok: true, dados: { itens, categorias: [] } });

    const elemento = await Geladeira();

    expect(buscar).toHaveBeenCalledWith({ disponiveis: false, ordem: "relevancia" });
    expect(elemento.props.catalogo).toBe(itens);
  });

  it("com a API fora do ar, a Geladeira abre do mesmo jeito, com a lista de adicionar vazia", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    buscar.mockResolvedValue({ ok: false });

    const elemento = await Geladeira();

    expect(elemento.props.catalogo).toEqual([]);
  });
});
