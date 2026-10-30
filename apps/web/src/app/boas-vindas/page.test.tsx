import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BoasVindas from "./page";

describe("Boas-vindas", () => {
  it("expõe o título e o slogan em texto e descreve a arte principal", () => {
    render(<BoasVindas />);

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
    expect(screen.getByText("Sabor Qualidade e Tradição")).toBeInTheDocument();
    expect(screen.queryByText("Cervejas artesanais e muito mais!")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Garrafa de IPA Leguelé Beer ao lado de um copo cheio, entre folhas de lúpulo",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });

  it("as palavras do slogan só aparecem no slogan, nunca como texto lateral", () => {
    render(<BoasVindas />);

    // O slogan é o único elemento com "Sabor"; um texto lateral seria outro elemento com essas palavras.
    const comSabor = screen.getAllByText(/Sabor/);

    expect(comSabor).toHaveLength(1);
    expect(comSabor[0]).toBe(screen.getByText("Sabor Qualidade e Tradição"));
    expect(comSabor[0]).toHaveClass("sr-only");
  });
});
