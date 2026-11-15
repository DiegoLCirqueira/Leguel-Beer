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
});
