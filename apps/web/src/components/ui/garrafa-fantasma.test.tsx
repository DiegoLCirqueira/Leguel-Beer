import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GarrafaFantasma } from "./garrafa-fantasma";

const frutas = { slug: "frutas", nome: "Frutas" };

describe("GarrafaFantasma", () => {
  it("é um botão lido como Adicionar <categoria>; tocar avisa a categoria, sem trocar de página", async () => {
    const aoTocar = vi.fn();
    render(<GarrafaFantasma categoria={frutas} aoTocar={aoTocar} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Adicionar Frutas" }));

    expect(aoTocar).toHaveBeenCalledWith(frutas, expect.any(HTMLElement));
  });
});
