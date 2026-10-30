import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BoasVindas from "./page";

describe("Boas-vindas", () => {
  it("expõe o título e o slogan em texto e mantém a arte como imagem decorativa", () => {
    const { container } = render(<BoasVindas />);

    expect(screen.getByRole("heading", { level: 1, name: "Leguelé Beer" })).toBeInTheDocument();
    expect(screen.getByText("Cervejas artesanais e muito mais!")).toBeInTheDocument();
    expect(screen.queryByText("Sabor Qualidade Tradição")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector('img[alt=""][src*="arte-login"]')).not.toBeNull();
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument();
  });
});
