import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BoasVindas from "./page";

describe("Boas-vindas", () => {
  it("mostra o logo, os textos da marca e a imagem principal", () => {
    render(<BoasVindas />);

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
    expect(screen.getByText(/^Cervejas artesanais/)).toHaveTextContent(
      "Cervejas artesanais e muito mais!",
    );
    expect(screen.queryByText("Sabor Qualidade Tradição")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Garrafa de IPA Leguelé Beer ao lado de um copo cheio, entre folhas de lúpulo",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });
});
