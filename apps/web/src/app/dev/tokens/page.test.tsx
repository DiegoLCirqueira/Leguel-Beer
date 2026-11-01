import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

import DevTokens from "./page";

describe("/dev/tokens", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("em desenvolvimento mostra a vitrine dos componentes", () => {
    render(<DevTokens />);

    expect(screen.getByRole("button", { name: "Todas (16)" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("mostra o Campo de digitar com contorno, para conferir a borda e o foco", () => {
    render(<DevTokens />);

    expect(screen.getByLabelText("Senha de exemplo")).toBeInTheDocument();
  });

  it("em produção não existe", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() => DevTokens()).toThrow("NEXT_NOT_FOUND");
  });
});
