import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ALTURA_BARRA_FIXA_PX, BarraFixa } from "./barra-fixa";

describe("BarraFixa", () => {
  it("mostra o conteúdo numa barra com a altura publicada em ALTURA_BARRA_FIXA_PX", () => {
    render(
      <BarraFixa>
        <button type="button">Adicionar à geladeira</button>
      </BarraFixa>,
    );

    const barra = screen.getByRole("button", { name: "Adicionar à geladeira" }).parentElement;
    expect(ALTURA_BARRA_FIXA_PX).toBe(80);
    expect(barra).toHaveStyle({ height: "80px" });
  });
});
