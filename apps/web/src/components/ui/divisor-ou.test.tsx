import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DivisorOu } from "./divisor-ou";

describe("DivisorOu", () => {
  it("mostra o texto ou entre duas linhas decorativas", () => {
    const { container } = render(<DivisorOu />);

    expect(screen.getByText("ou")).toBeInTheDocument();
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });
});
