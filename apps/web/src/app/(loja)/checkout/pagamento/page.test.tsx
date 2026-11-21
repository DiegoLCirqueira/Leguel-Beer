import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { lerToken, redirecionar } = vi.hoisted(() => ({
  lerToken: vi.fn(),
  redirecionar: vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
}));
vi.mock("@/lib/auth/servidor", () => ({ lerTokenDeAcesso: lerToken }));
vi.mock("next/navigation", () => ({
  redirect: redirecionar,
  usePathname: () => "/checkout/pagamento",
  useRouter: () => ({ replace: vi.fn() }),
}));

import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import Pagamento from "./page";

describe("/checkout/pagamento", () => {
  beforeEach(() => lerToken.mockResolvedValue("token-1"));

  it("sem sessão, leva a entrar e volta à etapa Pagamento", async () => {
    lerToken.mockResolvedValue(undefined);

    await expect(Pagamento()).rejects.toThrow("REDIRECT:/entrar?retorno=%2Fcheckout%2Fpagamento");
  });

  it("com sessão, mostra a etapa Pagamento com o aviso de portfólio", async () => {
    sessionStorage.setItem("lb:checkout", JSON.stringify({ enderecoId: "casa" }));
    render(<GeladeiraProvider>{await Pagamento()}</GeladeiraProvider>);

    expect(screen.getByText("2. Pagamento")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText(/projeto sem fins lucrativos/)).toBeInTheDocument();
  });
});
