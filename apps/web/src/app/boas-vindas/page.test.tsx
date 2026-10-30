import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BoasVindas from "./page";

describe("Boas-vindas", () => {
  it("expõe o título e o slogan em texto e descreve a arte principal", () => {
    render(<BoasVindas />);

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
    expect(screen.getByText("Cervejas artesanais")).toBeInTheDocument();
    expect(screen.queryByText(/muito mais/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Garrafa de IPA Leguelé Beer ao lado de um copo cheio, entre folhas de lúpulo",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });

  it("o slogan é um elemento só para leitor de tela e o texto lateral Sabor Qualidade Tradição não existe", () => {
    render(<BoasVindas />);

    const slogan = screen.getByText("Cervejas artesanais");

    expect(slogan).toHaveClass("sr-only");
    expect(screen.queryByText(/Sabor|Qualidade|Tradição/)).not.toBeInTheDocument();
  });
});
