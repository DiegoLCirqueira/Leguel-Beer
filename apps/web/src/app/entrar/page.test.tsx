import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Entrar from "./page";

const abrir = async (busca: Record<string, string> = {}) =>
  render(await Entrar({ searchParams: Promise.resolve(busca) }));

describe("/entrar", () => {
  it("mostra o título, o subtítulo, o logo, o voltar, o formulário e o rodapé", async () => {
    await abrir();

    expect(
      screen.getByRole("heading", { level: 1, name: "Entrar na sua conta" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Que bom te ver de novo!")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Leguelé Beer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/boas-vindas");
    expect(screen.getByLabelText("E-mail")).toHaveValue("");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("Manter-me conectado vem marcado quando a pessoa chega por outro caminho", async () => {
    await abrir();

    expect(screen.getByRole("checkbox", { name: "Manter-me conectado" })).toBeChecked();
  });

  it("Manter-me conectado vem da boas-vindas: desmarcado com manter-conectado=0", async () => {
    await abrir({ "manter-conectado": "0" });

    expect(screen.getByRole("checkbox", { name: "Manter-me conectado" })).not.toBeChecked();
  });

  it("vem com o e-mail preenchido quando o cadastro mandou a pessoa entrar", async () => {
    await abrir({ email: "ana@exemplo.com" });

    expect(screen.getByLabelText("E-mail")).toHaveValue("ana@exemplo.com");
  });

  it("avisa quando o link de confirmação é inválido ou já venceu, com o texto aprovado", async () => {
    await abrir({ aviso: "link-invalido" });

    expect(
      screen.getByText(
        "Este link de confirmação é inválido ou já venceu. Entre com seu e-mail e senha para receber um novo link.",
      ),
    ).toBeInTheDocument();
  });

  it("sem o parâmetro não mostra aviso nenhum", async () => {
    await abrir();

    expect(screen.queryByText(/link de confirmação é inválido/)).not.toBeInTheDocument();
  });
});
