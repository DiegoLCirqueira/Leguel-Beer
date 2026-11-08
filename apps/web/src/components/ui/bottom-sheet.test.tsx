import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./bottom-sheet";

const abrir = (aoFechar = vi.fn(), aberto = true) =>
  render(
    <BottomSheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Filtros e ordenação"
      rodape={<button type="button">Aplicar</button>}
    >
      <label>
        Categoria <input />
      </label>
    </BottomSheet>,
  );

describe("BottomSheet", () => {
  it("fechado não mostra nada", () => {
    abrir(vi.fn(), false);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("aberto é um diálogo modal com o título, o conteúdo e o rodapé", () => {
    abrir();

    const dialogo = screen.getByRole("dialog", { name: "Filtros e ordenação" });
    expect(dialogo).toHaveAttribute("aria-modal", "true");
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aplicar" })).toBeInTheDocument();
  });

  it("fecha com Esc", async () => {
    const aoFechar = vi.fn();
    abrir(aoFechar);

    await userEvent.keyboard("{Escape}");

    expect(aoFechar).toHaveBeenCalledOnce();
  });

  it("fecha ao tocar no fundo, mas não ao tocar dentro do painel", async () => {
    const aoFechar = vi.fn();
    abrir(aoFechar);

    await userEvent.click(screen.getByRole("dialog"));
    expect(aoFechar).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId("fundo-do-sheet"));

    expect(aoFechar).toHaveBeenCalledOnce();
  });
});
