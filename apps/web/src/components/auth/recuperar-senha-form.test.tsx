import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ResultadoPedido } from "@/lib/auth/recuperar-senha";
import { RecuperarSenhaForm } from "./recuperar-senha-form";

const renderizar = (resultado: ResultadoPedido = { tipo: "enviado" }) => {
  const pedir = vi.fn().mockResolvedValue(resultado);
  render(<RecuperarSenhaForm pedir={pedir} />);
  return pedir;
};

describe("RecuperarSenhaForm", () => {
  it("mostra o campo, o botão, os três avisos do Figma e o voltar para o login", () => {
    renderizar();

    expect(screen.getByLabelText("E-mail")).toHaveAttribute(
      "placeholder",
      "Digite seu e-mail cadastrado",
    );
    expect(screen.getByRole("button", { name: "Enviar link" })).toBeInTheDocument();
    expect(screen.getByText("Verifique sua caixa de entrada")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Enviaremos um link seguro para redefinir sua senha. Não se esqueça de checar a pasta de spam, se necessário.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("O link tem validade")).toBeInTheDocument();
    expect(
      screen.getByText("O link expira em 1 hora por questões de segurança."),
    ).toBeInTheDocument();
    expect(screen.getByText("Precisa de ajuda?")).toBeInTheDocument();
    expect(
      screen.getByText("Se não receber o e-mail, entre em contato com nosso suporte."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para o login" })).toHaveAttribute(
      "href",
      "/entrar",
    );
  });

  it("nosso suporte é texto, sem link", () => {
    renderizar();

    expect(screen.queryByRole("link", { name: /suporte/i })).toBeNull();
  });

  it("e-mail inválido mostra a mensagem junto do campo, foca nele e não envia", async () => {
    const pedir = renderizar();
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@");

    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(screen.getByLabelText("E-mail")).toHaveAccessibleDescription(
      "Informe um e-mail válido.",
    );
    expect(screen.getByLabelText("E-mail")).toHaveFocus();
    expect(pedir).not.toHaveBeenCalled();
  });

  it("envia o e-mail e mostra o aviso genérico de envio", async () => {
    const pedir = renderizar();
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");

    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(pedir).toHaveBeenCalledWith({ email: "ana@exemplo.com" });
    expect(
      await screen.findByText(
        "Se houver uma conta com esse e-mail, você vai receber o link em instantes.",
      ),
    ).toBeInTheDocument();
  });

  it("o erro inesperado mostra o aviso sem apagar o e-mail", async () => {
    renderizar({ tipo: "erro" });
    await userEvent.type(screen.getByLabelText("E-mail"), "ana@exemplo.com");

    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(
      await screen.findByText("Não foi possível concluir agora. Tente de novo em instantes."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveValue("ana@exemplo.com");
  });
});
