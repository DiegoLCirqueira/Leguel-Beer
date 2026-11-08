import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
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

  it("leva o foco para dentro ao abrir e devolve ao botão que abriu ao fechar", async () => {
    function Tela() {
      const [aberto, setAberto] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setAberto(true)}>
            Abrir filtros
          </button>
          <BottomSheet aberto={aberto} aoFechar={() => setAberto(false)} titulo="Filtros">
            <input aria-label="Campo" />
          </BottomSheet>
        </>
      );
    }
    render(<Tela />);
    const gatilho = screen.getByRole("button", { name: "Abrir filtros" });

    await userEvent.click(gatilho);
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(gatilho).toHaveFocus();
  });

  it("prende o foco: Tab no último volta ao primeiro e Shift+Tab no primeiro vai ao último", async () => {
    abrir();
    const campo = screen.getByLabelText("Categoria");
    const aplicar = screen.getByRole("button", { name: "Aplicar" });

    aplicar.focus();
    await userEvent.tab();
    expect(campo).toHaveFocus();
    await userEvent.tab({ shift: true });

    expect(aplicar).toHaveFocus();
  });

  it("trava a rolagem da página enquanto aberto e a devolve ao fechar", () => {
    const { rerender } = abrir();
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <BottomSheet aberto={false} aoFechar={vi.fn()} titulo="Filtros e ordenação">
        <p>x</p>
      </BottomSheet>,
    );

    expect(document.body.style.overflow).toBe("");
  });

  it("com o foco no próprio painel (clique no título), Shift+Tab e Tab não saem do diálogo", async () => {
    abrir();
    const dialogo = screen.getByRole("dialog");
    const campo = screen.getByLabelText("Categoria");
    const aplicar = screen.getByRole("button", { name: "Aplicar" });

    await userEvent.click(screen.getByRole("heading", { name: "Filtros e ordenação" }));
    await userEvent.tab({ shift: true });
    expect(dialogo.contains(document.activeElement)).toBe(true);
    expect(aplicar).toHaveFocus();

    await userEvent.click(screen.getByRole("heading", { name: "Filtros e ordenação" }));
    await userEvent.tab();

    expect(campo).toHaveFocus();
  });
});
