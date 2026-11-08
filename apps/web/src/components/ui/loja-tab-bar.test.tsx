import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const caminho = vi.hoisted(() => ({ atual: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => caminho.atual }));

import { LojaTabBar } from "./loja-tab-bar";

describe("LojaTabBar", () => {
  beforeEach(() => {
    caminho.atual = "/";
  });

  it("mostra as quatro abas com rótulo, na ordem e com o destino de cada uma", () => {
    render(<LojaTabBar />);

    const barra = screen.getByRole("navigation", { name: "Menu da loja" });
    const abas = within(barra).getAllByRole("link");
    expect(abas.map((aba) => aba.textContent)).toEqual([
      "Início",
      "Catálogo",
      "Geladeira",
      "Perfil",
    ]);
    expect(abas.map((aba) => aba.getAttribute("href"))).toEqual([
      "/",
      "/catalogo",
      "/geladeira",
      "/conta",
    ]);
  });

  it.each([
    ["/", "Início"],
    ["/catalogo", "Catálogo"],
    ["/catalogo?categoria=ipa", "Catálogo"],
    ["/geladeira", "Geladeira"],
    ["/conta", "Perfil"],
  ])("em %s marca só a aba %s como atual", (rota, nome) => {
    caminho.atual = rota.split("?")[0] ?? rota;

    render(<LojaTabBar />);

    const atuais = screen.getAllByRole("link").filter((a) => a.getAttribute("aria-current"));
    expect(atuais.map((a) => a.textContent)).toEqual([nome]);
    expect(atuais[0]).toHaveAttribute("aria-current", "page");
  });
});
