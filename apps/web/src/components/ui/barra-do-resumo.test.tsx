import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BarraDoResumo } from "./barra-do-resumo";

describe("BarraDoResumo", () => {
  it("mostra o subtotal e abre o resumo em 'Ver resumo'", async () => {
    const aoVerResumo = vi.fn();
    render(<BarraDoResumo quantidadeTotal={3} subtotalCentavos={9600} aoVerResumo={aoVerResumo} />);

    expect(screen.getByText("Subtotal (3 itens)")).toBeInTheDocument();
    expect(screen.getByText("R$ 96,00")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ver resumo" }));
    expect(aoVerResumo).toHaveBeenCalledTimes(1);
  });

  it("separa-se da Geladeira com borda viva e uma sombra suave para cima", () => {
    const { container } = render(
      <BarraDoResumo quantidadeTotal={3} subtotalCentavos={9600} aoVerResumo={() => {}} />,
    );

    const barra = container.firstElementChild!;
    expect(barra.className).toMatch(/border-primaria\/30/);
    expect(barra.className).toMatch(/shadow-\[0_-4px_8px/);
    // Mais baixa: não sobrepõe a base da geladeira (botão de 44 px + 4 px de cada lado).
    expect(barra.className).toMatch(/py-1(?!\d)/);
  });
});
