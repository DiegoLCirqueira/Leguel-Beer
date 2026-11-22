import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvisoDePortfolio } from "./aviso-de-portfolio";

describe("AvisoDePortfolio", () => {
  it("diz que o projeto é de portfólio e que nada é cobrado, sem botão de fechar", () => {
    render(<AvisoDePortfolio />);

    expect(
      screen.getByText(
        "Este é um projeto sem fins lucrativos, feito para portfólio. Nenhum pagamento é real e nada é cobrado.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
