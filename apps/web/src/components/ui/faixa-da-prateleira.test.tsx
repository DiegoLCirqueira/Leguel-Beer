import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaixaDaPrateleira } from "./faixa-da-prateleira";

describe("FaixaDaPrateleira", () => {
  it("prateleira vazia convida a escolher uma cerveja da categoria", () => {
    render(<FaixaDaPrateleira categoriaNome="Frutas" rotulos={[]} />);

    expect(screen.getByText("Toque no + para escolher uma Frutas")).toBeInTheDocument();
  });
});
