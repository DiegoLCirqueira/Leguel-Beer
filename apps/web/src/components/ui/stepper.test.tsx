import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("no mínimo desabilita o menos e no máximo desabilita o mais", () => {
    const { rerender } = render(<Stepper valor={1} aoAlterar={vi.fn()} rotulo="Q" />);
    expect(screen.getByRole("button", { name: "Diminuir quantidade" })).toBeDisabled();

    rerender(<Stepper valor={5} max={5} aoAlterar={vi.fn()} rotulo="Q" />);

    expect(screen.getByRole("button", { name: "Aumentar quantidade" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Diminuir quantidade" })).toBeEnabled();
  });
});
