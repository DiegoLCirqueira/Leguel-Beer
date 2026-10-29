import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { CategoryChips } from "./category-chips";

const items = [
  { id: "todas", label: "Todas", count: 16 },
  { id: "ipas", label: "IPAs", count: 4 },
  { id: "frutas", label: "Frutas", count: 4 },
];

function Harness() {
  const [value, setValue] = useState("todas");
  return <CategoryChips items={items} value={value} onChange={setValue} />;
}

describe("CategoryChips", () => {
  it("só um chip fica selecionado por vez", async () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Todas (16)" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "IPAs (4)" }));

    expect(screen.getByRole("button", { name: "IPAs (4)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Todas (16)" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Frutas (4)" })).toHaveAttribute("aria-pressed", "false");
  });
});
