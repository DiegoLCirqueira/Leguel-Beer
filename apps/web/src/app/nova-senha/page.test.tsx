import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NovaSenha from "./page";

const abrir = async (busca: { token_hash?: string; type?: string }) =>
  render(await NovaSenha({ searchParams: Promise.resolve(busca) }));

describe("/nova-senha", () => {
  it("com o link válido mostra o título Nova senha e o formulário, sem gastar o link", async () => {
    await abrir({ token_hash: "hash-1", type: "recovery" });

    expect(screen.getByRole("heading", { level: 1, name: "Nova senha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar nova senha" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/entrar");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it.each([{}, { token_hash: "h" }, { token_hash: "h", type: "signup" }])(
    "sem token ou com tipo errado (%j) mostra o aviso de link que não vale mais",
    async (busca) => {
      await abrir(busca);

      expect(screen.getByText("Este link expirou ou já foi usado.")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
        "href",
        "/recuperar-senha",
      );
      expect(screen.queryByRole("button", { name: "Salvar nova senha" })).toBeNull();
    },
  );
});
