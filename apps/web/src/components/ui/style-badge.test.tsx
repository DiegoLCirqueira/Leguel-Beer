import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StyleBadge } from "./style-badge";

describe("StyleBadge", () => {
  it.each([
    ["ipa", "IPA", "bg-badge-ipa"],
    ["frutas", "Frutas", "bg-badge-frutas"],
    ["malt", "Malt", "bg-badge-malt"],
    ["lager", "Lager", "bg-badge-lager"],
  ])("categoria %s usa o token da categoria e o nome em maiúsculas", (slug, name, tokenClass) => {
    render(<StyleBadge slug={slug} name={name} />);

    const badge = screen.getByText(name.toUpperCase());
    expect(badge).toHaveClass(tokenClass);
  });

  it("categoria sem token usa badge-neutro", () => {
    render(<StyleBadge slug="categoria-nova" name="Categoria nova" />);

    expect(screen.getByText("CATEGORIA NOVA")).toHaveClass("bg-badge-neutro");
  });
});
