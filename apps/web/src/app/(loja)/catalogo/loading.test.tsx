import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CarregandoCatalogo from "./loading";

describe("/catalogo carregando", () => {
  it("anuncia o carregamento e mostra o título e os blocos de skeleton da grade", () => {
    const { container } = render(<CarregandoCatalogo />);

    expect(screen.getByRole("status")).toHaveTextContent("Carregando o catálogo");
    expect(screen.getByRole("heading", { level: 1, name: "Catálogo" })).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThanOrEqual(4);
  });
});
