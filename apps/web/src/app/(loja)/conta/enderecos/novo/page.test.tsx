import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { lerToken, redirecionar, empurrar } = vi.hoisted(() => ({
  lerToken: vi.fn(),
  redirecionar: vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
  empurrar: vi.fn(),
}));
vi.mock("@/lib/auth/servidor", () => ({ lerTokenDeAcesso: lerToken }));
vi.mock("next/navigation", () => ({
  redirect: redirecionar,
  useRouter: () => ({ push: empurrar }),
}));
vi.mock("../actions", () => ({
  buscarCepAction: vi.fn(),
  salvarEnderecoAction: vi.fn().mockResolvedValue({ tipo: "ok" }),
}));

import NovoEndereco from "./page";

describe("/conta/enderecos/novo", () => {
  beforeEach(() => {
    lerToken.mockResolvedValue("token-1");
    empurrar.mockReset();
  });

  it("sem sessão, leva para entrar e volta para o formulário", async () => {
    lerToken.mockResolvedValue(undefined);

    await expect(NovoEndereco()).rejects.toThrow(
      "REDIRECT:/entrar?retorno=%2Fconta%2Fenderecos%2Fnovo",
    );
  });

  it("mostra o formulário 'Novo endereço' e Cancelar volta para a lista", async () => {
    render(await NovoEndereco());

    expect(screen.getByRole("heading", { level: 1, name: "Novo endereço" })).toBeInTheDocument();
    expect(screen.getByLabelText("CEP")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(empurrar).toHaveBeenCalledWith("/conta/enderecos");
  });
});
