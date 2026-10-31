import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BotaoVoltar } from "./botao-voltar";

describe("BotaoVoltar", () => {
  it("é um link de navegação com o nome Voltar, que leva à boas-vindas por padrão", () => {
    render(<BotaoVoltar />);

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/boas-vindas");
  });

  it("aceita outro destino", () => {
    render(<BotaoVoltar href="/entrar" />);

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/entrar");
  });
});
