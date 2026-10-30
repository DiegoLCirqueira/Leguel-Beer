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

  it("marca os dados da empresa como fictícios e repete que o projeto é de portfólio", () => {
    render(<SiteFooter />);

    expect(
      screen.getByText(
        "Leguelé Beer Cervejaria Artesanal Ltda. (empresa fictícia) · CNPJ 00.000.000/0001-00 (fictício) · Maceió, AL",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Leguelé Beer é um projeto de portfólio. Nenhuma venda é real e nenhum valor é cobrado.",
      ),
    ).toBeInTheDocument();
  });
});
