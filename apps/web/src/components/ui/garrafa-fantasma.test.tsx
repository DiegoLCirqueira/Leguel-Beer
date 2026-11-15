import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GarrafaFantasma } from "./garrafa-fantasma";

describe("GarrafaFantasma", () => {
  it("é um link lido como Adicionar <categoria> que abre o catálogo filtrado", () => {
    render(<GarrafaFantasma categoria={{ slug: "frutas", nome: "Frutas" }} />);

    const link = screen.getByRole("link", { name: "Adicionar Frutas" });
    expect(link).toHaveAttribute("href", "/catalogo?categoria=frutas");
  });
});
