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
vi.mock("next/navigation", () => ({
  redirect: redirecionar,
  usePathname: () => "/checkout/pagamento",
  useRouter: () => ({ replace: vi.fn() }),
}));

import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import Pagamento from "./page";

describe("/checkout/pagamento", () => {
  beforeEach(() => {
    lerToken.mockResolvedValue("token-1");
    buscar.mockResolvedValue({ tipo: "ok", enderecos: [{ id: "casa" }] });
  });

  it("sem sessão, leva a entrar e volta à etapa Pagamento", async () => {
    lerToken.mockResolvedValue(undefined);

    await expect(Pagamento()).rejects.toThrow("REDIRECT:/entrar?retorno=%2Fcheckout%2Fpagamento");
  });

  it("sessão vencida na API também leva a entrar", async () => {
    buscar.mockResolvedValue({ tipo: "sem-sessao" });

    await expect(Pagamento()).rejects.toThrow("REDIRECT:/entrar?retorno=%2Fcheckout%2Fpagamento");
  });

  it("sem conseguir buscar os endereços, avisa com Tentar de novo e não mostra a etapa", async () => {
    buscar.mockResolvedValue({ tipo: "erro" });

    render(<GeladeiraProvider>{await Pagamento()}</GeladeiraProvider>);

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar seus endereços");
    expect(screen.getByRole("link", { name: "Tentar de novo" })).toHaveAttribute(
      "href",
      "/checkout/pagamento",
    );
    expect(screen.queryByText("2. Pagamento")).not.toBeInTheDocument();
  });

  it("com sessão, mostra a etapa Pagamento com o aviso de portfólio", async () => {
    sessionStorage.setItem("lb:checkout", JSON.stringify({ enderecoId: "casa" }));
    render(<GeladeiraProvider>{await Pagamento()}</GeladeiraProvider>);

    expect(screen.getByText("2. Pagamento")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText(/projeto sem fins lucrativos/)).toBeInTheDocument();
  });
});
