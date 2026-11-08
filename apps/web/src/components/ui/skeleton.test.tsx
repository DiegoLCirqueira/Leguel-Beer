import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("é só decoração: fica fora da árvore de acessibilidade e aceita classes de tamanho", () => {
    const { container } = render(<Skeleton className="h-4 w-24" />);

    const bloco = container.firstElementChild;
    expect(bloco).not.toBeNull();
    expect(bloco).toHaveAttribute("aria-hidden", "true");
    expect(bloco).toHaveClass("h-4", "w-24");
  });

  it("pulsa, mas para quando a pessoa pede menos movimento", () => {
    const { container } = render(<Skeleton />);

    expect(container.firstElementChild).toHaveClass("animate-pulse", "motion-reduce:animate-none");
  });
});
