import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Admin from "./page";

describe("/admin", () => {
  it("mostra o título da área de administração (o proxy só deixa o admin chegar aqui)", () => {
    render(<Admin />);

    expect(screen.getByRole("heading", { level: 1, name: "Administração" })).toBeInTheDocument();
  });
});
