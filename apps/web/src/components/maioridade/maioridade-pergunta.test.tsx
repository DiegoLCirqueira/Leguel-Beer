import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MaioridadePergunta } from "./maioridade-pergunta";

const renderizar = (retorno = "/catalogo?categoria=ipa") =>
  render(<MaioridadePergunta retorno={retorno} confirmar={vi.fn()} />);

describe("MaioridadePergunta", () => {
  it("mostra a pergunta, o apoio, os dois botões e os avisos do rodapé", () => {
    renderizar();

    expect(
      screen.getByRole("heading", { level: 1, name: "Você tem 18 anos ou mais?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Para entrar, confirme sua idade.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sim, tenho 18 anos ou mais" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Não" })).toBeInTheDocument();
    expect(screen.getByText("Aprecie com moderação.")).toBeInTheDocument();
    expect(screen.getByText("Venda proibida para menores de 18 anos.")).toBeInTheDocument();
  });

  it("o botão de confirmar envia o formulário levando o retorno", async () => {
    const confirmar = vi.fn();
    render(<MaioridadePergunta retorno="/catalogo?categoria=ipa" confirmar={confirmar} />);

    await userEvent.click(screen.getByRole("button", { name: "Sim, tenho 18 anos ou mais" }));

    expect(confirmar).toHaveBeenCalledTimes(1);
    const dados = confirmar.mock.calls[0]?.[0] as FormData;
    expect(dados.get("retorno")).toBe("/catalogo?categoria=ipa");
  });

  it("responder não mostra o acesso negado e tira a pergunta", async () => {
    const confirmar = vi.fn();
    render(<MaioridadePergunta retorno="/catalogo" confirmar={confirmar} />);

    await userEvent.click(screen.getByRole("button", { name: "Não" }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Acesso não permitido" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Este site é só para maiores de 18 anos.")).toBeInTheDocument();
    expect(screen.queryByText("Você tem 18 anos ou mais?")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sim, tenho 18 anos ou mais" })).toBeNull();
    expect(confirmar).not.toHaveBeenCalled();
  });

  it("responder não leva o foco para o título do acesso negado", async () => {
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: "Não" }));

    expect(screen.getByRole("heading", { level: 1, name: "Acesso não permitido" })).toHaveFocus();
  });

  it("carrega com prioridade as imagens que aparecem na primeira tela", () => {
    const { container } = renderizar();

    // Com `priority` o next/image não põe loading="lazy" na imagem.
    for (const imagem of container.querySelectorAll("img")) {
      expect(imagem).not.toHaveAttribute("loading", "lazy");
    }
  });

  it("usa a imagem de fundo do estúdio, decorativa", () => {
    const { container } = renderizar();

    const fundo = container.querySelector('img[src*="maioridade%2Ffundo.webp"]');

    expect(fundo).not.toBeNull();
    expect(fundo).toHaveAttribute("alt", "");
  });

  it("serve o logo em larguras para telas de alta densidade (srcset por largura)", () => {
    renderizar();

    const logo = screen.getByRole("img", { name: "Leguelé Beer" });

    expect(logo.getAttribute("srcset")).toMatch(/ 384w/);
    expect(logo).toHaveAttribute("sizes", "128px");
  });

  it("no acesso não permitido, o botão Voltar para a página inicial leva de volta à pergunta", async () => {
    renderizar();
    await userEvent.click(screen.getByRole("button", { name: "Não" }));

    await userEvent.click(screen.getByRole("button", { name: "Voltar para a página inicial" }));

    const pergunta = screen.getByRole("heading", { level: 1, name: "Você tem 18 anos ou mais?" });
    expect(pergunta).toBeInTheDocument();
    expect(pergunta).toHaveFocus();
    expect(screen.queryByText("Acesso não permitido")).not.toBeInTheDocument();
  });

  it("a pergunta não mostra o botão de voltar", () => {
    renderizar();

    expect(screen.queryByRole("button", { name: "Voltar para a página inicial" })).toBeNull();
  });
});
