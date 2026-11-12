import type { AjusteDaGeladeira, CervejaCard, GeladeiraResponse } from "@leguele/shared";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const caminho = vi.hoisted(() => ({ atual: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => caminho.atual }));
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

afterEach(() => {
  localStorage.clear();
  ultimoDesfazer = null;
  caminho.atual = "/";
});

function Painel() {
  const g = useGeladeira();
  return (
    <div>
      <output aria-label="Ajustes da Geladeira">
        {g.ajustes
          .map((ajuste) =>
            ajuste.tipo === "preco-mudou"
              ? `${ajuste.nome}: ${ajuste.precoVistoCentavos} → ${ajuste.precoAtualCentavos}`
              : ajuste.nome,
          )
          .join(", ")}
      </output>
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

  it("falha do buscar não marca envio pendente: a carga seguinte não manda a cópia vazia por cima da conta", async () => {
    const conta = contaFalsa({ tipo: "erro" });
    const primeira = abrirComConta(conta);
    await screen.findByText("0");
    await vi.waitFor(() => expect(conta.buscar).toHaveBeenCalled());
    primeira.unmount();

    abrirComConta(conta);
    await screen.findByText("0");

    expect(localStorage.getItem(CHAVE_PENDENTE)).toBeNull();
    expect(conta.enviar).not.toHaveBeenCalled();
  });

  it("aparelho já sincronizado: vale sempre a da conta, mesmo vazia (esvaziada em outro aparelho)", async () => {
    guardarLocal(3);
    localStorage.setItem(CHAVE_DA_CONTA, "1");
    const conta = contaFalsa(ok([]));

    abrirComConta(conta);

    await vi.waitFor(() => expect(screen.getByTestId("total")).toHaveTextContent("0"));
    expect(conta.enviar).not.toHaveBeenCalled();
  });

  it("troca de conta: envio pendente que recebe sem-sessão apaga a cópia da conta anterior", async () => {
    guardarLocal(3);
    localStorage.setItem(CHAVE_DA_CONTA, "1");
    localStorage.setItem(CHAVE_PENDENTE, "1");
    const conta = contaFalsa({ tipo: "sem-sessao" }, { tipo: "sem-sessao" });

    abrirComConta(conta);

    await vi.waitFor(() => expect(localStorage.getItem(CHAVE_DA_GELADEIRA)).toBeNull());
    expect(screen.getByTestId("total")).toHaveTextContent("0");
    expect(localStorage.getItem(CHAVE_DA_CONTA)).toBeNull();
    expect(localStorage.getItem(CHAVE_PENDENTE)).toBeNull();
  });

  it("mudança feita com o buscar em voo não é sobrescrita pela resposta antiga", async () => {
    localStorage.setItem(CHAVE_DA_CONTA, "1");
    let responder: (r: ResultadoDaConta) => void = () => {};
    const conta = contaFalsa(ok([]));
    conta.buscar.mockReturnValue(new Promise<ResultadoDaConta>((r) => (responder = r)));
    abrirComConta(conta);
    await userEvent.click(await screen.findByRole("button", { name: "adicionar" }));

    await act(async () => responder(ok([])));

    expect(screen.getByTestId("total")).toHaveTextContent("1");
  });

  it("guarda os ajustes da resposta da conta no contexto", async () => {
    const resposta = daConta([{ cerveja, quantidade: 1 }]);
    const priceChange: AjusteDaGeladeira = {
      cervejaId: "a",
      nome: "Maré Alta",
      tipo: "preco-mudou",
      precoVistoCentavos: 3000,
      precoAtualCentavos: 3200,
    };
    resposta.ajustes = [priceChange];
    const conta = contaFalsa({ tipo: "ok", resposta });

    abrirComConta(conta);

    await vi.waitFor(() =>
      expect(screen.getByLabelText("Ajustes da Geladeira")).toHaveTextContent(
        "Maré Alta: 3000 → 3200",
      ),
    );
  });

  it("buscar de novo a cada troca de página (entrar e sair sem recarregar)", async () => {
    const conta = contaFalsa({ tipo: "sem-sessao" });
    const { rerender } = abrirComConta(conta);
    await vi.waitFor(() => expect(conta.buscar).toHaveBeenCalledTimes(1));

    caminho.atual = "/catalogo";
    rerender(
      <GeladeiraProvider conta={conta}>
        <Painel />
      </GeladeiraProvider>,
    );

    await vi.waitFor(() => expect(conta.buscar).toHaveBeenCalledTimes(2));
  });

  // Corrida: o buscar sobrescrevia 3 unidades por 1 se um envio anterior falhar enquanto
  // a nova página busca a conta. Requer reler CHAVE_PENDENTE após o await (correção do Front).
  it("envio que falha durante o buscar da próxima página preserva a mudança local pendente", async () => {
    guardarLocal(1);
    localStorage.setItem(CHAVE_DA_CONTA, "1");
    let finishSend!: (result: ResultadoDaConta) => void;
    let finishFetch!: (result: ResultadoDaConta) => void;
    const sendRequest = new Promise<ResultadoDaConta>((resolve) => (finishSend = resolve));
    const fetchRequest = new Promise<ResultadoDaConta>((resolve) => (finishFetch = resolve));
    const conta = contaFalsa(ok([{ cerveja, quantidade: 1 }]));
    conta.buscar.mockReturnValueOnce(Promise.resolve(ok([{ cerveja, quantidade: 1 }])));
    conta.buscar.mockReturnValueOnce(fetchRequest);
    conta.enviar.mockReturnValueOnce(sendRequest);
    const { rerender } = abrirComConta(conta);
    await vi.waitFor(() => expect(conta.buscar).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole("button", { name: "tres" }));
    await vi.waitFor(() => expect(conta.enviar).toHaveBeenCalledTimes(1));
    caminho.atual = "/catalogo";
    rerender(
      <GeladeiraProvider conta={conta}>
        <Painel />
      </GeladeiraProvider>,
    );
    await vi.waitFor(() => expect(conta.buscar).toHaveBeenCalledTimes(2));

    await act(async () => finishSend({ tipo: "erro" }));
    expect(localStorage.getItem(CHAVE_PENDENTE)).toBe("1");
    await act(async () => finishFetch(ok([{ cerveja, quantidade: 1 }])));

    expect(screen.getByTestId("total")).toHaveTextContent("3");
    expect(JSON.parse(localStorage.getItem(CHAVE_DA_GELADEIRA) ?? "{}").itens[0].quantidade).toBe(
      3,
    );
    expect(localStorage.getItem(CHAVE_PENDENTE)).toBe("1");
  });
});
