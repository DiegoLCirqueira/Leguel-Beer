import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const trocar = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  usePathname: () => "/checkout/pagamento",
  useRouter: () => ({ replace: trocar }),
}));
import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import { CHAVE_DO_CHECKOUT } from "@/lib/checkout/estado";
import { EtapaPagamento } from "./etapa-pagamento";

afterEach(() => {
  sessionStorage.clear();
  trocar.mockReset();
});

const abrir = (destinoDaRevisao?: string, guardado: object | null = { enderecoId: "casa" }) => {
  if (guardado) sessionStorage.setItem(CHAVE_DO_CHECKOUT, JSON.stringify(guardado));
  return render(
    <GeladeiraProvider>
      <EtapaPagamento destinoDaRevisao={destinoDaRevisao} />
    </GeladeiraProvider>,
  );
};

describe("EtapaPagamento", () => {
  it("mostra o aviso de portfólio, a etapa Pagamento e o Pix já selecionado", () => {
    abrir("/checkout/revisao");

    expect(screen.getByRole("heading", { level: 1, name: "Finalizar pedido" })).toBeInTheDocument();
    expect(screen.getByText("2. Pagamento")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText(/projeto sem fins lucrativos, feito para portfólio/)).toBeVisible();
    expect(screen.getByRole("radio", { name: /Pix/ })).toBeChecked();
    expect(screen.getByText(/QR/)).toBeInTheDocument();
  });

  it("'Voltar' leva à etapa Entrega", () => {
    abrir("/checkout/revisao");

    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/checkout");
  });

  it("'Continuar para revisão' guarda o Pix na aba, junto do endereço, e segue", async () => {
    abrir("/checkout/revisao");

    const seguir = screen.getByRole("link", { name: "Continuar para revisão" });
    expect(seguir).toHaveAttribute("href", "/checkout/revisao");
    await userEvent.click(seguir);

    expect(JSON.parse(sessionStorage.getItem(CHAVE_DO_CHECKOUT)!)).toEqual({
      enderecoId: "casa",
      pagamento: { tipo: "pix" },
    });
  });

  it("sem tela de revisão ainda, o botão fica desabilitado", () => {
    abrir(undefined);

    expect(screen.getByRole("button", { name: "Continuar para revisão" })).toBeDisabled();
  });

  it("sem endereço escolhido na aba, volta à Entrega (não dá para pular etapas pela URL)", () => {
    abrir("/checkout/revisao", null);

    expect(trocar).toHaveBeenCalledWith("/checkout");
  });

  it("com o endereço escolhido, fica na etapa", () => {
    abrir("/checkout/revisao");

    expect(trocar).not.toHaveBeenCalled();
  });
});
