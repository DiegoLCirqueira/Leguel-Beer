import type { CervejaDetalhe } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const buscar = vi.hoisted(() => vi.fn());
vi.mock("@/lib/catalogo/cerveja", () => ({ buscarCerveja: buscar }));

import Produto from "./page";

const cerveja: CervejaDetalhe = {
  id: "1",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: true,
  quantidadeDisponivel: 12,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
  descricao: null,
  precoAnteriorCentavos: null,
  descontoPercentual: null,
};

const abrir = async (slug: string) => render(await Produto({ params: Promise.resolve({ slug }) }));

describe("/catalogo/[slug]", () => {
  beforeEach(() => buscar.mockReset());

  it("busca a cerveja pelo slug da URL e mostra a página dela", async () => {
    buscar.mockResolvedValue({ tipo: "ok", cerveja });

    await abrir("mare-alta");

    expect(buscar).toHaveBeenCalledWith("mare-alta");
    expect(screen.getByRole("heading", { level: 1, name: "Maré Alta" })).toBeInTheDocument();
  });

  it("slug inexistente ou de cerveja inativa mostra Cerveja não encontrada", async () => {
    buscar.mockResolvedValue({ tipo: "nao-encontrada" });

    await abrir("nao-existe");

    expect(
      screen.getByRole("heading", { level: 1, name: "Cerveja não encontrada" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toBeInTheDocument();
  });

  it("se a API falha mostra o erro com Tentar de novo na mesma página, sem lançar", async () => {
    buscar.mockResolvedValue({ tipo: "erro" });

    await abrir("mare-alta");

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar a cerveja agora.",
    );
    expect(screen.getByRole("link", { name: "Tentar de novo" })).toHaveAttribute(
      "href",
      "/catalogo/mare-alta",
    );
  });
});
