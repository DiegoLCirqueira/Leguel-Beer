import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const redirect = vi.hoisted(() =>
  vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
);
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("next/headers", () => ({ cookies: async () => ({}) }));

import Confirmar from "./page";

const abrir = async (busca: { token_hash?: string; type?: string }) =>
  render(await Confirmar({ searchParams: Promise.resolve(busca) }));

describe("/auth/confirmar (GET)", () => {
  it("só mostra o botão Confirmar minha conta, sem gastar o token: quem confirma é o POST", async () => {
    await abrir({ token_hash: "hash-1", type: "signup" });

    const botao = screen.getByRole("button", { name: "Confirmar minha conta" });
    expect(botao).toHaveAttribute("type", "submit");
    const formulario = botao.closest("form");
    expect(formulario).not.toBeNull();
    expect(formulario?.querySelector('input[name="token_hash"]')).toHaveValue("hash-1");
    expect(formulario?.querySelector('input[name="type"]')).toHaveValue("signup");
    expect(
      screen.getByText("Toque no botão abaixo para ativar sua conta na Leguelé Beer."),
    ).toBeInTheDocument();
  });

  it.each([{}, { token_hash: "h" }, { token_hash: "h", type: "recovery" }])(
    "sem token ou com tipo desconhecido (%j) leva à tela de entrar com o aviso",
    async (busca) => {
      await expect(abrir(busca)).rejects.toThrow("REDIRECT:/entrar?aviso=link-invalido");
    },
  );
});
