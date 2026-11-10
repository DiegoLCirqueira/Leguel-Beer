import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CervejaNaoEncontrada } from "./cerveja-nao-encontrada";

describe("CervejaNaoEncontrada", () => {
  it("diz que a cerveja não foi encontrada e leva de volta ao catálogo", () => {
    render(<CervejaNaoEncontrada />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Cerveja não encontrada" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute("href", "/catalogo");
  });
});
