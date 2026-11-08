import type { CatalogoResponse } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const buscar = vi.hoisted(() => vi.fn());
vi.mock("@/lib/catalogo/buscar", () => ({ buscarCatalogo: buscar }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import Catalogo from "./page";

const dados: CatalogoResponse = {
  itens: [],
  total: 0,
  categorias: [{ slug: "ipa", nome: "IPA", ordem: 1, quantidade: 6 }],
};

const abrir = async (busca: Record<string, string | string[] | undefined> = {}) =>
  render(await Catalogo({ searchParams: Promise.resolve(busca) }));

describe("/catalogo", () => {
  beforeEach(() => buscar.mockReset());

  it("lê os filtros da URL, ignora o que for inválido e mostra o título, Filtrar e os chips", async () => {
    buscar.mockResolvedValue({ ok: true, dados });

    await abrir({ teor: "6-ou-mais", ordem: "inventada", categoria: ["ipa", "frutas"] });

    expect(buscar).toHaveBeenCalledWith({
      teor: "6-ou-mais",
      disponiveis: false,
      ordem: "relevancia",
    });
    expect(screen.getByRole("heading", { level: 1, name: "Catálogo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtrar (1)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "IPA (6)" })).toBeInTheDocument();
  });

  it("categoria que não existe é ignorada: busca sem ela, Todas marcada e sem Limpar filtros", async () => {
    buscar.mockResolvedValue({ ok: true, dados });

    await abrir({ categoria: "nao-existe" });

    expect(buscar).toHaveBeenLastCalledWith({ disponiveis: false, ordem: "relevancia" });
    expect(screen.getByRole("button", { name: "Todas (6)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "IPA (6)" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
  });

  it("categoria que existe continua marcada", async () => {
    buscar.mockResolvedValue({ ok: true, dados });

    await abrir({ categoria: "ipa" });

    expect(screen.getByRole("button", { name: "IPA (6)" })).toHaveAttribute("aria-pressed", "true");
  });

  it("se a API falha mostra o erro com Tentar de novo na mesma URL, sem lançar", async () => {
    buscar.mockResolvedValue({ ok: false });

    await abrir({ categoria: "ipa" });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar o catálogo agora.",
    );
    expect(screen.getByRole("link", { name: "Tentar de novo" })).toHaveAttribute(
      "href",
      "/catalogo?categoria=ipa",
    );
  });
});
