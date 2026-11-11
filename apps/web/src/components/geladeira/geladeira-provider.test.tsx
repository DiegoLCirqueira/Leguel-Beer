import type { CervejaCard } from "@leguele/shared";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { CHAVE_DA_GELADEIRA } from "@/lib/geladeira/armazenamento";
import type { Desfazer } from "@/lib/geladeira/estado";
import { GeladeiraProvider, useGeladeira } from "./geladeira-provider";

const cerveja: CervejaCard = {
  id: "a",
  slug: "a",
  nome: "Maré Alta",
  estilo: "American IPA",
  categoria: { slug: "ipa", nome: "IPAs", ordem: 1 },
  teorAlcoolico: 6.5,
  ibu: 65,
  volumeMl: 330,
  precoCentavos: 3200,
  destaque: false,
  quantidadeDisponivel: 5,
  esgotada: false,
  imagemUrl: null,
  cadastradaEm: "2026-10-01T10:00:00.000Z",
};

let ultimoDesfazer: Desfazer | null = null;

function Painel() {
  const g = useGeladeira();
  return (
    <div>
      <p data-testid="total">{g.pronta ? String(g.quantidadeTotal) : "carregando"}</p>
      <button type="button" onClick={() => g.adicionar(cerveja)}>
        adicionar
      </button>
      <button type="button" onClick={() => g.alterarQuantidade("a", 3)}>
        tres
      </button>
      <button
        type="button"
        onClick={() => {
          ultimoDesfazer = g.remover("a");
        }}
      >
        remover
      </button>
      <button type="button" onClick={() => ultimoDesfazer && g.desfazer(ultimoDesfazer)}>
        desfazer
      </button>
    </div>
  );
}

const abrir = () =>
  render(
    <GeladeiraProvider>
      <Painel />
    </GeladeiraProvider>,
  );

describe("GeladeiraProvider (convidado)", () => {
  afterEach(() => {
    localStorage.clear();
    ultimoDesfazer = null;
  });

  it("só mostra o total depois de ler a cópia local e começa em 0", async () => {
    abrir();

    expect(await screen.findByText("0")).toBeInTheDocument();
  });

  it("adicionar, alterar, remover e desfazer mudam o total e gravam a cópia local", async () => {
    abrir();
    await screen.findByText("0");

    await userEvent.click(screen.getByRole("button", { name: "adicionar" }));
    expect(screen.getByTestId("total")).toHaveTextContent("1");
    await userEvent.click(screen.getByRole("button", { name: "tres" }));
    expect(screen.getByTestId("total")).toHaveTextContent("3");
    expect(JSON.parse(localStorage.getItem(CHAVE_DA_GELADEIRA) ?? "{}").itens[0].quantidade).toBe(
      3,
    );
    await userEvent.click(screen.getByRole("button", { name: "remover" }));
    expect(screen.getByTestId("total")).toHaveTextContent("0");
    await userEvent.click(screen.getByRole("button", { name: "desfazer" }));

    expect(screen.getByTestId("total")).toHaveTextContent("3");
  });

  it("recarregar o site (nova montagem) continua com a Geladeira do convidado", async () => {
    const primeira = abrir();
    await screen.findByText("0");
    await userEvent.click(screen.getByRole("button", { name: "adicionar" }));
    await act(async () => primeira.unmount());

    abrir();

    expect(await screen.findByText("1")).toBeInTheDocument();
  });

  it("cópia local inválida começa vazia, sem erro na tela", async () => {
    localStorage.setItem(CHAVE_DA_GELADEIRA, "{quebrado");

    abrir();

    expect(await screen.findByText("0")).toBeInTheDocument();
  });
});
