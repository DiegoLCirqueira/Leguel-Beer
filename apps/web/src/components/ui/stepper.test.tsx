import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Stepper } from "./stepper";

describe("Stepper", () => {
  it("é um grupo com rótulo que mostra a quantidade e os dois botões", () => {
    render(<Stepper valor={2} aoAlterar={vi.fn()} rotulo="Quantidade de Maré Alta IPA" />);

    const grupo = screen.getByRole("group", { name: "Quantidade de Maré Alta IPA" });
    expect(grupo).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: "Diminuir quantidade" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Aumentar quantidade" })).toBeEnabled();
  });

  it("mais e menos pedem a quantidade seguinte e a anterior", async () => {
    const aoAlterar = vi.fn();
    render(<Stepper valor={3} aoAlterar={aoAlterar} rotulo="Quantidade" />);

    await userEvent.click(screen.getByRole("button", { name: "Aumentar quantidade" }));
    await userEvent.click(screen.getByRole("button", { name: "Diminuir quantidade" }));

    expect(aoAlterar).toHaveBeenNthCalledWith(1, 4);
    expect(aoAlterar).toHaveBeenNthCalledWith(2, 2);
  });

  it("no limite o botão fica aria-disabled (continua focável) e o toque é ignorado", async () => {
    const aoAlterar = vi.fn();
    const { rerender } = render(<Stepper valor={1} aoAlterar={aoAlterar} rotulo="Q" />);
    const menos = screen.getByRole("button", { name: "Diminuir quantidade" });
    expect(menos).toHaveAttribute("aria-disabled", "true");
    expect(menos).not.toBeDisabled();
    menos.focus();
    await userEvent.click(menos);
    expect(aoAlterar).not.toHaveBeenCalled();
    expect(menos).toHaveFocus();

    rerender(<Stepper valor={5} max={5} aoAlterar={aoAlterar} rotulo="Q" />);

    const mais = screen.getByRole("button", { name: "Aumentar quantidade" });
    expect(mais).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(mais);
    expect(aoAlterar).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Diminuir quantidade" })).not.toHaveAttribute(
      "aria-disabled",
    );
  });

  it("o valor é um output educado que muda de texto quando a quantidade muda", async () => {
    function Controlado() {
      const [valor, setValor] = useState(2);
      return <Stepper valor={valor} aoAlterar={setValor} rotulo="Quantidade" />;
    }
    render(<Controlado />);
    const saida = screen.getByRole("status");
    expect(saida.tagName).toBe("OUTPUT");
    expect(saida).toHaveAttribute("aria-live", "polite");
    expect(saida).toHaveTextContent("2");

    await userEvent.click(screen.getByRole("button", { name: "Aumentar quantidade" }));

    expect(saida).toHaveTextContent("3");
  });
});
