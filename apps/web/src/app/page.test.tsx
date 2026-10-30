import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home", () => {
  it("mostra o título Leguelé Beer", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
  });

  it("exibe a vitrine dos componentes base", () => {
    render(<Home />);

    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Todas (16)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByText("IPA")).toBeInTheDocument();
  });
});
