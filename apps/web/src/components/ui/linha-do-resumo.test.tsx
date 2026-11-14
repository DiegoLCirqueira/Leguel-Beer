import type { CervejaCard } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LinhaDoResumo } from "./linha-do-resumo";

const mare: CervejaCard = {
  id: "mare",
  slug: "mare-alta",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: false,
  quantidadeDisponivel: 9,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
};

const renderizar = (props: Partial<Parameters<typeof LinhaDoResumo>[0]> = {}) =>
  render(
    <ul>
      <LinhaDoResumo
        item={{ cerveja: mare, quantidade: 2 }}
        aoAlterar={() => {}}
        aoRemover={() => {}}
        {...props}
      />
    </ul>,
  );

describe("LinhaDoResumo", () => {
  it("mostra selo, nome, estilo • teor • volume, preço unitário e total da linha", () => {
    renderizar();

    const linha = screen.getByRole("listitem");
    expect(within(linha).getByText("IPAS")).toBeInTheDocument();
    expect(within(linha).getByText("Maré Alta")).toBeInTheDocument();
    expect(within(linha).getByText("American IPA • 6,5% • 330ml")).toBeInTheDocument();
    expect(within(linha).getByText("R$ 32,00 un.")).toBeInTheDocument();
    expect(within(linha).getByText("R$ 64,00")).toBeInTheDocument();
  });

  it("o Stepper leva a nova quantidade e o Remover avisa, ambos com alvo de 44 px", async () => {
    const aoAlterar = vi.fn();
    const aoRemover = vi.fn();
    renderizar({ aoAlterar, aoRemover });

    const grupo = screen.getByRole("group", { name: "Quantidade de Maré Alta" });
    await userEvent.click(within(grupo).getByRole("button", { name: "Aumentar quantidade" }));
    await userEvent.click(screen.getByRole("button", { name: "Remover Maré Alta" }));

    expect(aoAlterar).toHaveBeenCalledWith(3);
    expect(aoRemover).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Remover Maré Alta" }).className).toContain("size-11");
  });

  it("o '+' fica ativo no limite: quem usa o Stepper decide o aviso", async () => {
    const aoAlterar = vi.fn();
    renderizar({ item: { cerveja: mare, quantidade: 9 }, aoAlterar });

    await userEvent.click(screen.getByRole("button", { name: "Aumentar quantidade" }));

    expect(aoAlterar).toHaveBeenCalledWith(10);
  });
});
