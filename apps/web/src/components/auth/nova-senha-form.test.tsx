import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NovaSenhaForm, type RespostaNovaSenha } from "./nova-senha-form";

const renderizar = (resposta: RespostaNovaSenha | void = undefined) => {
  const salvar = vi.fn().mockResolvedValue(resposta);
  render(<NovaSenhaForm salvar={salvar} />);
  return salvar;
};

async function preencher(senha = "nova-senha-123", confirmacao = "nova-senha-123") {
  await userEvent.type(screen.getByLabelText("Nova senha"), senha);
  await userEvent.type(screen.getByLabelText("Confirmar senha"), confirmacao);
}

describe("NovaSenhaForm", () => {
  it("mostra os dois campos com os placeholders, o olho e o botão Salvar nova senha", () => {
    renderizar();

    expect(screen.getByPlaceholderText("Digite a nova senha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirme a nova senha")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Mostrar senha" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Salvar nova senha" })).toBeInTheDocument();
  });

  it("mostra as mensagens da senha curta e da confirmação diferente, sem enviar", async () => {
    const salvar = renderizar();
    await preencher("abc123", "abc123");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(screen.getByLabelText("Nova senha")).toHaveAccessibleDescription(
      "A senha precisa ter pelo menos 8 caracteres.",
    );

    await userEvent.clear(screen.getByLabelText("Nova senha"));
    await userEvent.clear(screen.getByLabelText("Confirmar senha"));
    await preencher("nova-senha-123", "outra-senha-123");
    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(screen.getByLabelText("Confirmar senha")).toHaveAccessibleDescription(
      "As senhas não conferem.",
    );
    expect(salvar).not.toHaveBeenCalled();
  });

  it("envia a senha e a confirmação", async () => {
    const salvar = renderizar();
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(salvar).toHaveBeenCalledWith({ senha: "nova-senha-123", confirmacao: "nova-senha-123" });
  });

  it("link que não vale mais mostra o aviso e a ação Pedir novo link", async () => {
    renderizar({ tipo: "link-invalido" });
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(await screen.findByText("Este link expirou ou já foi usado.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
  });

  it("o erro inesperado mostra o aviso sem apagar o que foi digitado", async () => {
    renderizar({ tipo: "erro" });
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(
      await screen.findByText("Não foi possível concluir agora. Tente de novo em instantes."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nova senha")).toHaveValue("nova-senha-123");
  });

  it("senha que não foi salva depois de gastar o link pede um novo link", async () => {
    renderizar({ tipo: "senha-nao-salva" });
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    expect(
      await screen.findByText("Não foi possível salvar a nova senha. Peça um novo link."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
  });

  it("senha salva (a ação rejeita com o erro de redirect do Next) não mostra aviso nenhum", async () => {
    const salvar = renderizar();
    salvar.mockRejectedValue(
      Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;push;/;307;" }),
    );
    await preencher();

    await userEvent.click(screen.getByRole("button", { name: "Salvar nova senha" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar nova senha" })).toBeEnabled(),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
