import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BotaoVoltarLegal } from "./botao-voltar-legal";

function simularChegada(referrer: string, tamanhoDoHistorico: number) {
  Object.defineProperty(document, "referrer", { value: referrer, configurable: true });
  Object.defineProperty(window.history, "length", {
    value: tamanhoDoHistorico,
    configurable: true,
  });
}

describe("BotaoVoltarLegal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("é um link Voltar que, sem JavaScript, leva à boas-vindas", () => {
    render(<BotaoVoltarLegal />);

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/boas-vindas");
  });

  it("quem veio de outra página do site volta na história", async () => {
    const voltar = vi.spyOn(window.history, "back").mockImplementation(() => {});
    simularChegada(`${window.location.origin}/entrar`, 3);
    render(<BotaoVoltarLegal />);

    await userEvent.click(screen.getByRole("link", { name: "Voltar" }));

    expect(voltar).toHaveBeenCalledTimes(1);
  });

  it("na aba nova aberta pelo cadastro o link leva de volta ao /criar-conta, sem voltar na história", async () => {
    const voltar = vi.spyOn(window.history, "back").mockImplementation(() => {});
    simularChegada(`${window.location.origin}/criar-conta`, 1);
    render(<BotaoVoltarLegal />);

    expect(await screen.findByRole("link", { name: "Voltar" })).toHaveAttribute(
      "href",
      "/criar-conta",
    );
    expect(voltar).not.toHaveBeenCalled();
  });

  it("link direto, sem referrer, leva à boas-vindas", () => {
    simularChegada("", 1);
    render(<BotaoVoltarLegal />);

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/boas-vindas");
  });
});
