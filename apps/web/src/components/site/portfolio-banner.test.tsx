import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PortfolioBanner } from "./portfolio-banner";

describe("PortfolioBanner", () => {
  it("avisa que é um projeto de portfólio com pagamentos em modo de teste", () => {
    render(<PortfolioBanner />);

    expect(
      screen.getByText("Projeto de portfólio · pagamentos em modo de teste"),
    ).toBeInTheDocument();
  });

  it("não tem botão para fechar", () => {
    render(<PortfolioBanner />);

    expect(screen.queryByRole("button")).toBeNull();
  });
});
