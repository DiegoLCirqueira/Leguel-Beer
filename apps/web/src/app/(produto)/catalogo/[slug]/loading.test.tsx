import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CarregandoProduto from "./loading";

describe("página de produto carregando", () => {
  it("anuncia o carregamento e mostra blocos de skeleton no lugar da ficha", () => {
    const { container } = render(<CarregandoProduto />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando a cerveja");
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(4);
  });
});
