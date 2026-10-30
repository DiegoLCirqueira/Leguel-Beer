import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CriarConta from "./page";

describe("/criar-conta", () => {
  it("mostra o título, o subtítulo do Figma, o logo, o voltar e o formulário", () => {
    render(<CriarConta />);

    expect(screen.getByRole("heading", { level: 1, name: "Criar sua conta" })).toBeInTheDocument();
    expect(
      screen.getByText("Faça parte do nosso clube e viva experiências exclusivas!"),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Leguelé Beer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/boas-vindas");
    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeInTheDocument();
  });

  it("só o logo é imagem com descrição; fundo e folhagens são decorativos", () => {
    render(<CriarConta />);

    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
