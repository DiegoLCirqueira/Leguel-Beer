import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RecuperarSenha from "./page";

describe("/recuperar-senha", () => {
  it("mostra o título, o texto do Figma, o logo, o voltar, o formulário e o rodapé", () => {
    render(<RecuperarSenha />);

    expect(screen.getByRole("heading", { level: 1, name: "Recuperar senha" })).toBeInTheDocument();
    expect(
      screen.getByText("Digite seu e-mail e enviaremos um link para você redefinir sua senha."),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Leguelé Beer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/entrar");
    expect(screen.getByRole("button", { name: "Enviar link" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("só o logo é imagem com descrição", () => {
    render(<RecuperarSenha />);

    expect(screen.getAllByRole("img")).toHaveLength(1);
  });
});
