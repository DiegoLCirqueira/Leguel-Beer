import type { EnderecoResposta } from "@leguele/shared";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { lerToken, buscar, redirecionar } = vi.hoisted(() => ({
  lerToken: vi.fn(),
  buscar: vi.fn(),
  redirecionar: vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
}));
vi.mock("@/lib/auth/servidor", () => ({ lerTokenDeAcesso: lerToken }));
vi.mock("@/lib/enderecos/buscar", () => ({ buscarEnderecos: buscar }));
vi.mock("next/navigation", () => ({ redirect: redirecionar, usePathname: () => "/checkout" }));
vi.mock("@/app/geladeira/frete", () => ({
  cotarFreteDoEnderecoAction: vi
    .fn()
    .mockResolvedValue({ tipo: "frete", frete: { tipo: "gratis" } }),
}));

import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import Checkout from "./page";

const casa: EnderecoResposta = {
  id: "casa",
  apelido: "Casa",
  cep: "57035000",
  rua: "Avenida Fernandes Lima",
  numero: "100",
  bairro: "Farol",
  cidade: "Maceió",
  uf: "AL",
  padrao: true,
  foraDaArea: false,
};

describe("/checkout", () => {
  beforeEach(() => {
    lerToken.mockResolvedValue("token-1");
    buscar.mockResolvedValue({ tipo: "ok", enderecos: [casa] });
  });

  it("sem sessão, leva a entrar e volta ao checkout", async () => {
    lerToken.mockResolvedValue(undefined);

    await expect(Checkout()).rejects.toThrow("REDIRECT:/entrar?retorno=%2Fcheckout");
  });

  it("sessão vencida na API também leva a entrar", async () => {
    buscar.mockResolvedValue({ tipo: "sem-sessao" });

    await expect(Checkout()).rejects.toThrow("REDIRECT:/entrar?retorno=%2Fcheckout");
  });

  it("mostra a etapa Entrega com os endereços da conta", async () => {
    render(<GeladeiraProvider>{await Checkout()}</GeladeiraProvider>);

    expect(screen.getByRole("heading", { level: 1, name: "Finalizar pedido" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Casa/ })).toBeChecked();
    expect(buscar).toHaveBeenCalledWith("token-1");
  });

  it("falha ao buscar os endereços mostra o aviso com Tentar de novo", async () => {
    buscar.mockResolvedValue({ tipo: "erro" });

    render(<GeladeiraProvider>{await Checkout()}</GeladeiraProvider>);

    expect(screen.getByText("Não foi possível carregar seus endereços agora.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tentar de novo" })).toHaveAttribute(
      "href",
      "/checkout",
    );
  });
});
