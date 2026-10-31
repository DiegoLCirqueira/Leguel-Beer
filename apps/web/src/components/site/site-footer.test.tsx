import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("mostra os avisos do rodapé", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Aprecie com moderação.")).toBeInTheDocument();
    expect(screen.getByText("Venda proibida para menores de 18 anos.")).toBeInTheDocument();
  });

  it("tem links para termos, privacidade e entregas", () => {
    render(<SiteFooter />);
    const rodape = within(screen.getByRole("contentinfo"));

    expect(rodape.getByRole("link", { name: "Termos de Uso" })).toHaveAttribute("href", "/termos");
    expect(rodape.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
    expect(rodape.getByRole("link", { name: "Entregas" })).toHaveAttribute("href", "/entregas");
  });

  it("não traz os dados da empresa nem fala em projeto de portfólio: só os avisos e os links", () => {
    render(<SiteFooter />);

    expect(screen.queryByText(/CNPJ|empresa fictícia|Maceió/)).not.toBeInTheDocument();
    expect(screen.queryByText(/portfólio/i)).not.toBeInTheDocument();
  });
});
