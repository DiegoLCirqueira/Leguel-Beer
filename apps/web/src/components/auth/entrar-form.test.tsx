import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EntrarForm, type RespostaEntrar } from "./entrar-form";

function renderizar(
  resposta: RespostaEntrar | void = undefined,
  extras: {
    email?: string;
    manterConectado?: boolean;
    reenviar?: () => Promise<"enviado" | "erro">;
  } = {},
) {
  const entrar = vi.fn().mockResolvedValue(resposta);
  const reenviar = vi.fn(extras.reenviar ?? (() => Promise.resolve("enviado" as const)));
  render(
    <EntrarForm
      entrar={entrar}
      reenviar={reenviar}
      emailInicial={extras.email}
      manterConectadoInicial={extras.manterConectado ?? true}
    />,
  );
  return { entrar, reenviar };
}

async function preencher(email = "ana@exemplo.com", senha = "qualquer") {
  await userEvent.type(screen.getByLabelText("E-mail"), email);
  await userEvent.type(screen.getByLabelText("Senha"), senha);
}

describe("EntrarForm", () => {
  it("mostra os campos, Manter-me conectado marcado, esqueci minha senha e o convite para criar conta", () => {
    renderizar();

    expect(screen.getByPlaceholderText("Digite seu e-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua senha")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Manter-me conectado" })).toBeChecked();
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByText("Ainda não tem conta?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/criar-conta",
    );
  });

  it("vem com o e-mail preenchido e com Manter-me conectado como a boas-vindas mandou", () => {
    renderizar(undefined, { email: "ana@exemplo.com", manterConectado: false });

    expect(screen.getByLabelText("E-mail")).toHaveValue("ana@exemplo.com");
    expect(screen.getByRole("checkbox", { name: "Manter-me conectado" })).not.toBeChecked();
  });

  it("o olho mostra e esconde a senha", async () => {
    renderizar();

    await userEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Esconder senha" })).toBeInTheDocument();
  });

  it("mostra a mensagem de cada campo inválido, foca o primeiro e não chama o servidor", async () => {
    const { entrar } = renderizar();
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@");

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription(
      "Informe um e-mail válido.",
    );
    expect(screen.getByLabelText("Senha")).toHaveAccessibleDescription("Informe sua senha.");
    expect(screen.getByLabelText("E-mail")).toHaveFocus();
    expect(entrar).not.toHaveBeenCalled();
  });

  it("envia o e-mail, a senha e a escolha de Manter-me conectado", async () => {
    const { entrar } = renderizar();
    await preencher();
    await userEvent.click(screen.getByRole("checkbox", { name: "Manter-me conectado" }));

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(entrar).toHaveBeenCalledWith({
      email: "ana@exemplo.com",
      senha: "qualquer",
      manterConectado: false,
    });
  });

  it("e-mail ou senha errados mostram o mesmo aviso, sem dizer qual está errado", async () => {
    renderizar({ tipo: "credenciais" });
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("E-mail ou senha inválidos")).toBeInTheDocument();
  });

  it("conta não confirmada oferece reenviar o link e confirma o reenvio", async () => {
    const { reenviar } = renderizar({ tipo: "nao-confirmado", email: "ana@exemplo.com" });
    await preencher();
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText(/Confirme seu e-mail para entrar\. Não recebeu\?/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Reenviar link" }));

    expect(reenviar).toHaveBeenCalledWith("ana@exemplo.com");
    expect(
      await screen.findByText("Enviamos um novo link para ana@exemplo.com."),
    ).toBeInTheDocument();
  });

  it("mostra o erro inesperado sem apagar o que foi digitado", async () => {
    renderizar({ tipo: "erro" });
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Não foi possível concluir agora. Tente de novo em instantes."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveValue("ana@exemplo.com");
  });

  it("login bem-sucedido (a ação rejeita com o erro de redirect do Next) não mostra aviso nenhum", async () => {
    const { entrar } = renderizar();
    entrar.mockRejectedValue(
      Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;push;/;307;" }),
    );
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Entrar" })).toBeEnabled());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
