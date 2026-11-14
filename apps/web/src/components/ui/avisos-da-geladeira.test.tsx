import type { AjusteDaGeladeira } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvisosDaGeladeira } from "./avisos-da-geladeira";

const precoMudou: AjusteDaGeladeira = {
  tipo: "preco-mudou",
  cervejaId: "mare",
  nome: "Maré Alta",
  precoVistoCentavos: 3200,
  precoAtualCentavos: 3500,
};
const indisponivel: AjusteDaGeladeira = { tipo: "indisponivel", cervejaId: "umbu", nome: "Umbu" };
const reduzida: AjusteDaGeladeira = {
  tipo: "quantidade-reduzida",
  cervejaId: "cupuacu",
  nome: "Cupuaçu Ale",
  quantidadeAnterior: 5,
  quantidadeAtual: 2,
};

describe("AvisosDaGeladeira", () => {
  it("mostra um aviso por ajuste, na ordem, numa região de status", () => {
    render(<AvisosDaGeladeira ajustes={[precoMudou, indisponivel, reduzida]} />);

    const regiao = screen.getByRole("status");
    expect(
      within(regiao)
        .getAllByRole("listitem")
        .map((i) => i.textContent),
    ).toEqual([
      "O preço de Maré Alta mudou",
      "Umbu não está mais disponível",
      "A quantidade de Cupuaçu Ale foi ajustada para 2",
    ]);
  });

  it("chama a cerveja sem nome de 'Uma cerveja'", () => {
    render(<AvisosDaGeladeira ajustes={[{ tipo: "indisponivel", cervejaId: "x", nome: null }]} />);

    expect(screen.getByRole("listitem")).toHaveTextContent("Uma cerveja não está mais disponível");
  });

  it("sem ajustes a região de status fica vazia, pronta para anunciar", () => {
    render(<AvisosDaGeladeira ajustes={[]} />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});
