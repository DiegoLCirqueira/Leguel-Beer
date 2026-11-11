import type { CervejaCard, GeladeiraResponse } from "@leguele/shared";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContaDaGeladeira, ResultadoDaConta } from "@/lib/geladeira/conta";
import { CHAVE_DA_CONTA, CHAVE_DA_GELADEIRA, CHAVE_PENDENTE } from "@/lib/geladeira/armazenamento";
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

const daConta = (itens: { cerveja: CervejaCard; quantidade: number }[]): GeladeiraResponse => ({
  itens: itens.map((i) => ({
    cerveja: i.cerveja,
    quantidade: i.quantidade,
    totalCentavos: i.quantidade * i.cerveja.precoCentavos,
  })),
  ajustes: [],
  quantidadeTotal: itens.reduce((s, i) => s + i.quantidade, 0),
  subtotalCentavos: itens.reduce((s, i) => s + i.quantidade * i.cerveja.precoCentavos, 0),
});

const ok = (itens: { cerveja: CervejaCard; quantidade: number }[]): ResultadoDaConta => ({
  tipo: "ok",
  resposta: daConta(itens),
});

const contaFalsa = (buscar: ResultadoDaConta, enviar: ResultadoDaConta = ok([])) =>
  ({
    buscar: vi.fn().mockResolvedValue(buscar),
    enviar: vi.fn().mockResolvedValue(enviar),
  }) satisfies ContaDaGeladeira;

const abrirComConta = (conta: ContaDaGeladeira) =>
  render(
    <GeladeiraProvider conta={conta}>
      <Painel />
    </GeladeiraProvider>,
  );

const guardarLocal = (quantidade: number) =>
  localStorage.setItem(
    CHAVE_DA_GELADEIRA,
    JSON.stringify({ versao: 1, itens: [{ cerveja, quantidade }] }),
  );

describe("GeladeiraProvider com a conta", () => {
  afterEach(() => {
    localStorage.clear();
    ultimoDesfazer = null;
  });

  it("convidado (sem sessão): nada vai para a conta, nem a cada mudança", async () => {
    const conta = contaFalsa({ tipo: "sem-sessao" });
    abrirComConta(conta);
    await screen.findByText("0");

    await userEvent.click(screen.getByRole("button", { name: "adicionar" }));

    expect(screen.getByTestId("total")).toHaveTextContent("1");
    expect(conta.enviar).not.toHaveBeenCalled();
  });

  it("ao entrar com a conta vazia, a Geladeira do convidado passa para a conta", async () => {
    guardarLocal(2);
    const conta = contaFalsa(ok([]), ok([{ cerveja, quantidade: 2 }]));

    abrirComConta(conta);

    expect(await screen.findByText("2")).toBeInTheDocument();
    await vi.waitFor(() =>
      expect(conta.enviar).toHaveBeenCalledWith({
        itens: [{ cervejaId: "a", quantidade: 2, precoVistoCentavos: 3200 }],
      }),
    );
    expect(localStorage.getItem(CHAVE_DA_CONTA)).toBe("1");
  });

  it("ao entrar com itens na conta, vale a da conta e a do convidado é descartada", async () => {
    guardarLocal(2);
    const conta = contaFalsa(ok([{ cerveja, quantidade: 4 }]));

    abrirComConta(conta);

    expect(await screen.findByText("4")).toBeInTheDocument();
    expect(conta.enviar).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem(CHAVE_DA_GELADEIRA) ?? "{}").itens[0].quantidade).toBe(
      4,
    );
  });

  it("ao sair da conta a cópia local é apagada", async () => {
    guardarLocal(3);
    localStorage.setItem(CHAVE_DA_CONTA, "1");
    const conta = contaFalsa({ tipo: "sem-sessao" });

    abrirComConta(conta);

    await vi.waitFor(() => expect(screen.getByTestId("total")).toHaveTextContent("0"));
    expect(localStorage.getItem(CHAVE_DA_GELADEIRA)).toBeNull();
    expect(localStorage.getItem(CHAVE_DA_CONTA)).toBeNull();
  });

  it("com a conta, cada mudança manda a Geladeira inteira", async () => {
    const conta = contaFalsa(ok([]));
    abrirComConta(conta);
    await screen.findByText("0");
    await vi.waitFor(() => expect(localStorage.getItem(CHAVE_DA_CONTA)).toBe("1"));

    await userEvent.click(screen.getByRole("button", { name: "adicionar" }));

    await vi.waitFor(() =>
      expect(conta.enviar).toHaveBeenLastCalledWith({
        itens: [{ cervejaId: "a", quantidade: 1, precoVistoCentavos: 3200 }],
      }),
    );
  });

  it("falha no envio (rejeitando ou com erro) mantém a cópia local e reenvia tudo na próxima mudança", async () => {
    const conta = contaFalsa(ok([]));
    conta.enviar.mockRejectedValueOnce(new Error("sem rede"));
    abrirComConta(conta);
    await screen.findByText("0");
    await vi.waitFor(() => expect(localStorage.getItem(CHAVE_DA_CONTA)).toBe("1"));

    await userEvent.click(screen.getByRole("button", { name: "adicionar" }));
    await vi.waitFor(() => expect(localStorage.getItem(CHAVE_PENDENTE)).toBe("1"));
    expect(screen.getByTestId("total")).toHaveTextContent("1");
    await userEvent.click(screen.getByRole("button", { name: "tres" }));

    await vi.waitFor(() =>
      expect(conta.enviar).toHaveBeenLastCalledWith({
        itens: [{ cervejaId: "a", quantidade: 3, precoVistoCentavos: 3200 }],
      }),
    );
    await vi.waitFor(() => expect(localStorage.getItem(CHAVE_PENDENTE)).toBeNull());
  });

  it("conta sem perfil (409) na passagem do convidado: mantém a Geladeira local, sem erro", async () => {
    guardarLocal(2);
    const conta = contaFalsa(ok([]), { tipo: "sem-perfil" });

    abrirComConta(conta);

    expect(await screen.findByText("2")).toBeInTheDocument();
    await vi.waitFor(() => expect(localStorage.getItem(CHAVE_PENDENTE)).toBe("1"));
  });
});
