import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IconeDaCategoria } from "./icone-da-categoria";

const icone = (slug: string) =>
  render(<IconeDaCategoria slug={slug} />).container.querySelector("svg");

describe("IconeDaCategoria", () => {
  it("cada categoria do MVP tem o seu ícone, decorativo", () => {
    expect(icone("ipa")).toHaveClass("lucide-hop");
    expect(icone("frutas")).toHaveClass("lucide-citrus");
    expect(icone("malt")).toHaveClass("lucide-wheat");
    expect(icone("lager")).toHaveClass("lucide-snowflake");
    expect(icone("ipa")).toHaveAttribute("aria-hidden", "true");
  });

  it("'todas' e categoria desconhecida usam a caneca", () => {
    expect(icone("todas")).toHaveClass("lucide-beer");
    expect(icone("categoria-nova")).toHaveClass("lucide-beer");
  });

  it("slug que existe no Object (constructor, toString) cai na caneca, sem quebrar", () => {
    expect(icone("constructor")).toHaveClass("lucide-beer");
    expect(icone("toString")).toHaveClass("lucide-beer");
    expect(icone("__proto__")).toHaveClass("lucide-beer");
  });
});
