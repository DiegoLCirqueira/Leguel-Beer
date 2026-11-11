import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkGeladeira } from "./link-geladeira";

describe("LinkGeladeira", () => {
  it("leva à Geladeira com o contador no nome e no texto, no singular com um item", () => {
    const { rerender } = render(<LinkGeladeira count={3} />);
    const link = screen.getByRole("link", { name: "Geladeira, 3 itens" });
    expect(link).toHaveAttribute("href", "/geladeira");
    expect(link).toHaveTextContent("3");

    rerender(<LinkGeladeira count={1} />);

    expect(screen.getByRole("link", { name: "Geladeira, 1 item" })).toBeInTheDocument();
  });
});
