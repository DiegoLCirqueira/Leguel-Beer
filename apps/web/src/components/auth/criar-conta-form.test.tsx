import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ResultadoCriarConta } from "@/lib/auth/criar-conta";
import { CriarContaForm } from "./criar-conta-form";

const renderizar = (
  resultado: ResultadoCriarConta = { tipo: "enviado", email: "ana@exemplo.com" },
) => {
  const criar = vi.fn().mockResolvedValue(resultado);
  render(<CriarContaForm criar={criar} />);
  return criar;
};

async function preencherValido() {
  await userEvent.type(screen.getByLabelText("Nome completo"), "Ana Souza");
  await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");
  await userEvent.type(screen.getByLabelText("Telefone"), "82999990000");
  await userEvent.type(screen.getByLabelText("Senha", { exact: true }), "senha-segura");
  await userEvent.type(screen.getByLabelText("Confirmar senha"), "senha-segura");
  await userEvent.click(screen.getByRole("checkbox", { name: /Eu aceito os Termos de Uso/ }));
}

describe("CriarContaForm", () => {
  it("mostra os campos do Figma com os placeholders e o aceite com os links em nova aba", () => {
    renderizar();

    expect(screen.getByPlaceholderText("Digite seu nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite seu e-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("(00) 00000-0000")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua senha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirme sua senha")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Eu aceito os Termos de Uso/ })).not.toBeChecked();
    const termos = screen.getByRole("link", { name: "Termos de Uso" });
    expect(termos).toHaveAttribute("href", "/termos");
    expect(termos).toHaveAttribute("target", "_blank");
    expect(termos).toHaveAttribute("rel", expect.stringContaining("noopener"));
    const privacidade = screen.getByRole("link", { name: "Política de Privacidade" });
    expect(privacidade).toHaveAttribute("href", "/privacidade");
    expect(privacidade).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("button", { name: "Criar conta" })).toBeInTheDocument();
  });

  it("aplica a máscara no telefone enquanto digita", async () => {
    renderizar();

    await userEvent.type(screen.getByLabelText("Telefone"), "82999990000");

    expect(screen.getByLabelText("Telefone")).toHaveValue("(82) 99999-0000");
  });

  it("o olho mostra e esconde cada senha", async () => {
    renderizar();
    const senha = screen.getByLabelText("Senha", { exact: true });
    expect(senha).toHaveAttribute("type", "password");

    await userEvent.click(screen.getAllByRole("button", { name: "Mostrar senha" })[0]!);

    expect(senha).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Confirmar senha")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Esconder senha" })).toBeInTheDocument();
  });

  it("mostra a mensagem junto de cada campo inválido e não chama o servidor", async () => {
    const criar = renderizar();

    await userEvent.type(screen.getByLabelText("E-mail"), "ana@");
    await userEvent.type(screen.getByLabelText("Telefone"), "821234");
    await userEvent.type(screen.getByLabelText("Senha", { exact: true }), "abc123");
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    const nome = screen.getByLabelText("Nome completo");
    expect(nome).toHaveAttribute("aria-invalid", "true");
    expect(nome).toHaveAccessibleDescription("Informe seu nome completo.");
    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription(
      "Informe um e-mail válido.",
    );
    expect(screen.getByLabelText("Telefone")).toHaveAccessibleDescription(
      "Informe um telefone com DDD.",
    );
    expect(screen.getByLabelText("Senha", { exact: true })).toHaveAccessibleDescription(
      "A senha precisa ter pelo menos 8 caracteres.",
    );
    expect(screen.getByText("Aceite os termos para criar sua conta.")).toBeInTheDocument();
    expect(criar).not.toHaveBeenCalled();
  });

  it("aponta a confirmação diferente da senha", async () => {
    renderizar();
    await preencherValido();
    await userEvent.clear(screen.getByLabelText("Confirmar senha"));
    await userEvent.type(screen.getByLabelText("Confirmar senha"), "outra-senha");

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(screen.getByLabelText("Confirmar senha")).toHaveAccessibleDescription(
      "As senhas não conferem.",
    );
  });

  it("envia os dados e avisa que o link de confirmação foi enviado", async () => {
    const criar = renderizar();
    await preencherValido();

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(criar).toHaveBeenCalledTimes(1));
    expect(criar).toHaveBeenCalledWith({
      nome: "Ana Souza",
      email: "ana@exemplo.com",
      telefone: "(82) 99999-0000",
      senha: "senha-segura",
      confirmacao: "senha-segura",
      aceite: true,
    });
    expect(
      await screen.findByText(
        "Enviamos um link de confirmação para ana@exemplo.com. Abra o e-mail para ativar sua conta.",
      ),
    ).toBeInTheDocument();
  });

  it("e-mail que já tem conta leva à tela de entrar com o e-mail preenchido", async () => {
    renderizar({ tipo: "email-ja-cadastrado", email: "ana@exemplo.com" });
    await preencherValido();

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText(/Este e-mail já tem conta\./)).toBeInTheDocument();
    const entrar = screen
      .getAllByRole("link", { name: "Entrar" })
      .find((link) => link.getAttribute("href")?.includes("email="));
    expect(entrar).toHaveAttribute("href", "/entrar?email=ana%40exemplo.com");
  });

  it("mostra o erro inesperado sem apagar o que foi digitado", async () => {
    renderizar({ tipo: "erro" });
    await preencherValido();

    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(
      await screen.findByText("Não foi possível concluir agora. Tente de novo em instantes."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Ana Souza");
  });

  it("mostra o convite para entrar no rodapé do formulário", () => {
    renderizar();

    expect(screen.getByText("Já tem uma conta?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/entrar");
  });
});
