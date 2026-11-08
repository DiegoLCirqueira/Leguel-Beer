import type { CatalogoQuery } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { FiltrosDoCatalogo } from "./filtros-do-catalogo";

const padrao: CatalogoQuery = { disponiveis: false, ordem: "relevancia" };

describe("FiltrosDoCatalogo", () => {
  beforeEach(() => push.mockReset());

  it("mostra Filtrar com a contagem de filtros ativos e abre o sheet com as faixas", async () => {
    render(<FiltrosDoCatalogo query={{ ...padrao, teor: "6-ou-mais", disponiveis: true }} />);

    await userEvent.click(screen.getByRole("button", { name: "Filtrar (2)" }));

    const sheet = screen.getByRole("dialog", { name: "Filtros e ordenação" });
    for (const grupo of ["Teor alcoólico", "IBU (amargor)", "Faixa de preço"]) {
      expect(within(sheet).getByRole("group", { name: grupo })).toBeInTheDocument();
    }
    expect(within(sheet).getByRole("radio", { name: "6% ou mais" })).toBeChecked();
    expect(within(sheet).getByRole("switch", { name: "Somente disponíveis" })).toBeChecked();
    expect(within(sheet).getByRole("combobox", { name: "Ordenar por" })).toHaveValue("relevancia");
  });

  it("Aplicar leva as escolhas para a URL, mantendo a categoria, e fecha o sheet", async () => {
    render(<FiltrosDoCatalogo query={{ ...padrao, categoria: "ipa" }} />);
    await userEvent.click(screen.getByRole("button", { name: "Filtrar" }));

    await userEvent.click(screen.getByRole("radio", { name: "20 a menos de 40" }));
    await userEvent.click(screen.getByRole("switch", { name: "Somente disponíveis" }));
    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: "Ordenar por" }),
      "menor-preco",
    );
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));

    expect(push).toHaveBeenCalledWith(
      "/catalogo?categoria=ipa&ibu=20-a-40&disponiveis=true&ordem=menor-preco",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Limpar tira teor, IBU, preço e disponíveis, mantém a categoria e fecha", async () => {
    render(
      <FiltrosDoCatalogo
        query={{
          ...padrao,
          categoria: "ipa",
          teor: "6-ou-mais",
          preco: "30-ou-mais",
          disponiveis: true,
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Filtrar (3)" }));

    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));

    expect(push).toHaveBeenCalledWith("/catalogo?categoria=ipa");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
