import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeloEsgotado } from "./selo-esgotado";

describe("SeloEsgotado", () => {
  it("mostra o texto Esgotado e aceita classes de posição", () => {
    render(<SeloEsgotado className="absolute right-0" />);

    expect(screen.getByText("Esgotado")).toHaveClass("absolute", "right-0");
  });
});
