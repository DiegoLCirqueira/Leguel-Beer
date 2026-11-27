import type { CervejaCard, GeladeiraResponse } from "@leguele/shared";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/geladeira" }));
import { CHAVE_DA_CONTA, CHAVE_DA_GELADEIRA } from "@/lib/geladeira/armazenamento";
import type { ContaDaGeladeira } from "@/lib/geladeira/conta";
import { GeladeiraProvider } from "./geladeira-provider";
import type { ResultadoDoFrete } from "@/app/geladeira/frete";
import { GeladeiraTela } from "./geladeira-tela";

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

afterEach(() => localStorage.clear());

const guardar = (itens: { cerveja: CervejaCard; quantidade: number }[]) =>
  localStorage.setItem(CHAVE_DA_GELADEIRA, JSON.stringify({ versao: 1, itens }));

const abrir = (catalogo: CervejaCard[] = []) =>
  render(
    <GeladeiraProvider>
      <GeladeiraTela catalogo={catalogo} />
    </GeladeiraProvider>,
  );

const cupuacu: CervejaCard = {
  ...mare,
  id: "cupuacu",
  slug: "cupuacu-ale",
  nome: "Cupuaçu Ale",
  estilo: "Fruit Ale",
  categoria: { slug: "frutas", nome: "Frutas", ordem: 2 },
  precoCentavos: 2650,
};

describe("GeladeiraTela", () => {
  it("vazia, mostra as 4 prateleiras só com garrafas fantasma", () => {
    abrir();

    expect(screen.getByRole("heading", { level: 1, name: "Geladeira" })).toBeInTheDocument();
    for (const categoria of ["IPA", "Frutas", "Malt", "Lager"]) {
      const prateleira = screen.getByRole("region", { name: categoria });
      expect(
        within(prateleira).getAllByRole("button", { name: `Adicionar ${categoria}` }),
      ).toHaveLength(4);
    }
  });

  it("com 2 Maré Alta, a faixa da IPA lê o rótulo e sobram 2 garrafas fantasma", () => {
    guardar([{ cerveja: mare, quantidade: 2 }]);
    abrir();

    const ipa = screen.getByRole("region", { name: "IPA" });
    expect(within(ipa).getByText("Maré Alta, 2 unidades, R$ 64,00")).toBeInTheDocument();
    expect(within(ipa).getAllByRole("button", { name: "Adicionar IPA" })).toHaveLength(2);
  });

  it("antes de ler a cópia local (HTML do servidor), mostra o carregamento e não as prateleiras", () => {
    const html = renderToString(
      <GeladeiraProvider>
        <GeladeiraTela />
      </GeladeiraProvider>,
    );

    expect(html).toContain("Carregando a Geladeira");
    expect(html).not.toContain("Adicionar IPA");
  });

  describe("resumo (LB-51)", () => {
    const comMaisUma = { ...mare, id: "umbu", slug: "umbu", nome: "Umbu", precoCentavos: 2800 };

    it("no celular, a barra mostra o subtotal e 'Ver resumo' abre o sheet com as linhas e as ações", async () => {
      guardar([
        { cerveja: mare, quantidade: 2 },
        { cerveja: comMaisUma, quantidade: 1 },
      ]);
      abrir();

      const barra = screen.getByRole("button", { name: "Ver resumo" }).parentElement!;
      expect(within(barra).getByText("Subtotal (3 itens)")).toBeInTheDocument();
      expect(within(barra).getByText("R$ 92,00")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Ver resumo" }));

      const sheet = screen.getByRole("dialog", { name: "Resumo da Geladeira" });
      expect(within(sheet).getAllByRole("listitem")).toHaveLength(2);
      expect(within(sheet).getByRole("link", { name: "Finalizar compra" })).toHaveAttribute(
        "href",
        "/checkout",
      );
      expect(within(sheet).getByRole("link", { name: "Continuar comprando" })).toHaveAttribute(
        "href",
        "/catalogo",
      );
    });

    it("vazia, não há barra nem resumo", () => {
      abrir();

      expect(screen.queryByRole("button", { name: "Ver resumo" })).not.toBeInTheDocument();
    });

    it("a partir de 1024 px o resumo é a coluna da direita, sem barra nem sheet", () => {
      window.matchMedia = (consulta: string) =>
        ({
          matches: consulta === "(min-width: 1024px)",
          media: consulta,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList;
      guardar([{ cerveja: mare, quantidade: 2 }]);
      abrir();

      expect(screen.queryByRole("button", { name: "Ver resumo" })).not.toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      const resumo = screen.getByRole("complementary", { name: "Resumo da Geladeira" });
      expect(within(resumo).getAllByRole("listitem")).toHaveLength(1);
      expect(within(resumo).getByText("Subtotal (2 itens)")).toBeInTheDocument();
    });
  });

  describe("alterar e remover (LB-50)", () => {
    const abrirResumo = async () => {
      abrir();
      await userEvent.click(screen.getByRole("button", { name: "Ver resumo" }));
      return screen.getByRole("dialog", { name: "Resumo da Geladeira" });
    };

    it("'Remover' tira a cerveja e o toast 'saiu da geladeira' devolve com 'Desfazer'", async () => {
      guardar([{ cerveja: mare, quantidade: 2 }]);
      const sheet = await abrirResumo();

      await userEvent.click(within(sheet).getByRole("button", { name: "Remover Maré Alta" }));

      expect(screen.getByText("Maré Alta saiu da geladeira")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Ver resumo" })).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Desfazer" }));

      expect(screen.queryByText("Maré Alta saiu da geladeira")).not.toBeInTheDocument();
      const ipa = screen.getByRole("region", { name: "IPA" });
      expect(within(ipa).getByText("Maré Alta, 2 unidades, R$ 64,00")).toBeInTheDocument();
    });

    it("o Stepper muda a quantidade", async () => {
      guardar([{ cerveja: mare, quantidade: 1 }]);
      const sheet = await abrirResumo();

      await userEvent.click(within(sheet).getByRole("button", { name: "Aumentar quantidade" }));
      expect(
        within(sheet).getByRole("group", { name: "Quantidade de Maré Alta" }),
      ).toHaveTextContent("2");

      await userEvent.click(within(sheet).getByRole("button", { name: "Diminuir quantidade" }));
      expect(
        within(sheet).getByRole("group", { name: "Quantidade de Maré Alta" }),
      ).toHaveTextContent("1");
    });

    it('toco em "−" da cerveja com 1 unidade: ela sai da Geladeira e vejo o toast com "Desfazer"', async () => {
      guardar([
        { cerveja: mare, quantidade: 2 },
        {
          cerveja: { ...mare, id: "ponta", slug: "ponta", nome: "Ponta Verde Pilsen" },
          quantidade: 1,
        },
      ]);
      const sheet = await abrirResumo();

      await userEvent.click(
        within(
          within(sheet).getByRole("group", { name: "Quantidade de Ponta Verde Pilsen" }),
        ).getByRole("button", { name: "Diminuir quantidade" }),
      );

      expect(within(sheet).getAllByRole("listitem")).toHaveLength(1);
      expect(within(sheet).getByText("Ponta Verde Pilsen saiu da geladeira")).toBeInTheDocument();
      await userEvent.click(within(sheet).getByRole("button", { name: "Desfazer" }));
      expect(within(sheet).getAllByRole("listitem")).toHaveLength(2);
    });

    it("'+' no limite mostra 'Só temos N unidades' e nada muda", async () => {
      guardar([{ cerveja: { ...mare, quantidadeDisponivel: 2 }, quantidade: 2 }]);
      const sheet = await abrirResumo();

      await userEvent.click(within(sheet).getByRole("button", { name: "Aumentar quantidade" }));

      expect(screen.getByText("Só temos 2 unidades")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Desfazer" })).not.toBeInTheDocument();
      expect(
        within(sheet).getByRole("group", { name: "Quantidade de Maré Alta" }),
      ).toHaveTextContent("2");
    });

    it("um toast novo substitui o anterior: só o último remover pode ser desfeito", async () => {
      const umbu = { ...mare, id: "umbu", slug: "umbu", nome: "Umbu" };
      guardar([
        { cerveja: mare, quantidade: 1 },
        { cerveja: umbu, quantidade: 1 },
      ]);
      const sheet = await abrirResumo();

      await userEvent.click(within(sheet).getByRole("button", { name: "Remover Maré Alta" }));
      await userEvent.click(within(sheet).getByRole("button", { name: "Remover Umbu" }));

      expect(screen.queryByText("Maré Alta saiu da geladeira")).not.toBeInTheDocument();
      expect(screen.getByText("Umbu saiu da geladeira")).toBeInTheDocument();
    });
  });

  describe("avisos da revalidação (LB-52)", () => {
    const resposta = {
      itens: [{ cerveja: mare, quantidade: 2, totalCentavos: 6400 }],
      ajustes: [
        {
          tipo: "preco-mudou" as const,
          cervejaId: "mare",
          nome: "Maré Alta",
          precoVistoCentavos: 3000,
          precoAtualCentavos: 3200,
        },
      ],
      quantidadeTotal: 2,
      subtotalCentavos: 6400,
    };
    const conta: ContaDaGeladeira = {
      buscar: vi.fn().mockResolvedValue({ tipo: "ok", resposta }),
      enviar: vi.fn().mockResolvedValue({ tipo: "ok", resposta }),
      validar: vi.fn().mockResolvedValue({ tipo: "erro" }),
    };

    function ComSaida() {
      const [naTela, setNaTela] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setNaTela((v) => !v)}>
            alternar
          </button>
          {naTela ? <GeladeiraTela /> : null}
        </>
      );
    }

    it("mostra os avisos no topo e eles somem ao sair da Geladeira", async () => {
      render(
        <GeladeiraProvider conta={conta}>
          <ComSaida />
        </GeladeiraProvider>,
      );

      expect(await screen.findByText("O preço de Maré Alta mudou")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "alternar" }));
      await userEvent.click(screen.getByRole("button", { name: "alternar" }));

      expect(screen.queryByText("O preço de Maré Alta mudou")).not.toBeInTheDocument();
    });
  });

  describe("frete estimado (item 4)", () => {
    const telaLarga = () => {
      window.matchMedia = (consulta: string) =>
        ({
          matches: consulta === "(min-width: 1024px)",
          media: consulta,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList;
    };
    const daConta = (quantidade: number): GeladeiraResponse => ({
      itens: [{ cerveja: mare, quantidade, totalCentavos: quantidade * mare.precoCentavos }],
      ajustes: [],
      quantidadeTotal: quantidade,
      subtotalCentavos: quantidade * mare.precoCentavos,
    });
    // O frete é da conta: a Geladeira vem dela e cada mudança local é enviada para ela.
    const abrirComFrete = (
      cotarFrete: () => Promise<ResultadoDoFrete>,
      enviar: ContaDaGeladeira["enviar"] = async () => ({ tipo: "ok", resposta: daConta(3) }),
    ) => {
      localStorage.setItem(CHAVE_DA_CONTA, "1");
      const conta: ContaDaGeladeira = {
        buscar: async () => ({ tipo: "ok", resposta: daConta(2) }),
        enviar,
        validar: async () => ({ tipo: "erro" }),
      };
      return render(
        <GeladeiraProvider conta={conta}>
          <GeladeiraTela cotarFrete={cotarFrete} />
        </GeladeiraProvider>,
      );
    };

    it("com endereço padrão, mostra o frete e o total com frete", async () => {
      telaLarga();
      guardar([{ cerveja: mare, quantidade: 2 }]);
      abrirComFrete(async () => ({ tipo: "frete", frete: { tipo: "valor", centavos: 1300 } }));

      const resumo = screen.getByRole("complementary", { name: "Resumo da Geladeira" });
      expect(await within(resumo).findByText("R$ 13,00")).toBeInTheDocument();
      expect(within(resumo).getByText("R$ 77,00")).toBeInTheDocument();
    });

    it("sem endereço ou sem sessão, segue pedindo o endereço", async () => {
      telaLarga();
      guardar([{ cerveja: mare, quantidade: 2 }]);
      const cotar = vi.fn().mockResolvedValue({ tipo: "sem-endereco" });
      abrirComFrete(cotar);

      await waitFor(() => expect(cotar).toHaveBeenCalled());
      expect(screen.getByText("Informe seu endereço para calcular o frete")).toBeInTheDocument();
    });

    it("a resposta atrasada de uma cotação antiga não substitui a mais nova", async () => {
      telaLarga();
      guardar([{ cerveja: mare, quantidade: 2 }]);
      const respostas: ((r: ResultadoDoFrete) => void)[] = [];
      const cotar = vi.fn(
        () => new Promise<ResultadoDoFrete>((resolve) => respostas.push(resolve)),
      );
      abrirComFrete(cotar);
      // Uma cotação ao abrir e outra quando a conta devolve a Geladeira.
      await waitFor(() => expect(cotar).toHaveBeenCalledTimes(2));
      await userEvent.click(screen.getByRole("button", { name: "Aumentar quantidade" }));
      await waitFor(() => expect(cotar).toHaveBeenCalledTimes(3));

      respostas[2]!({ tipo: "frete", frete: { tipo: "gratis" } });
      expect(await screen.findByText("Grátis")).toBeInTheDocument();
      respostas[0]!({ tipo: "frete", frete: { tipo: "valor", centavos: 1300 } });
      respostas[1]!({ tipo: "frete", frete: { tipo: "valor", centavos: 1300 } });

      await new Promise((r) => setTimeout(r, 20));
      expect(screen.getByText("Grátis")).toBeInTheDocument();
      expect(screen.queryByText("R$ 13,00")).not.toBeInTheDocument();
    });

    it("cota de novo quando o envio da Geladeira para a conta termina, não antes", async () => {
      telaLarga();
      guardar([{ cerveja: mare, quantidade: 2 }]);
      let concluirEnvio: () => void = () => {};
      let enviado = false;
      const enviar: ContaDaGeladeira["enviar"] = () =>
        new Promise((resolve) => {
          concluirEnvio = () => {
            enviado = true;
            resolve({ tipo: "ok", resposta: daConta(3) });
          };
        });
      // A API cota com a Geladeira da conta: só vê o subtotal novo depois do envio.
      const cotar = vi.fn(async (): Promise<ResultadoDoFrete> => ({
        tipo: "frete",
        frete: enviado ? { tipo: "gratis" } : { tipo: "valor", centavos: 300 },
      }));
      abrirComFrete(cotar, enviar);
      expect(await screen.findByText("R$ 3,00")).toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Aumentar quantidade" }));
      const chamadasAntes = cotar.mock.calls.length;
      concluirEnvio();

      expect(await screen.findByText("Grátis")).toBeInTheDocument();
      expect(cotar.mock.calls.length).toBeGreaterThan(chamadasAntes);
      expect(screen.queryByText("R$ 3,00")).not.toBeInTheDocument();
    });
  });

  describe("conta que não respondeu", () => {
    it("busca que falhou avisa com Tentar de novo, em vez de mostrar a Geladeira vazia em silêncio", async () => {
      const buscar = vi
        .fn()
        .mockResolvedValueOnce({ tipo: "erro" })
        .mockResolvedValue({
          tipo: "ok",
          resposta: {
            itens: [{ cerveja: mare, quantidade: 2, totalCentavos: 2 * mare.precoCentavos }],
            ajustes: [],
            quantidadeTotal: 2,
            subtotalCentavos: 2 * mare.precoCentavos,
          },
        });
      const conta: ContaDaGeladeira = {
        buscar,
        enviar: async () => ({ tipo: "erro" }),
        validar: async () => ({ tipo: "erro" }),
      };
      render(
        <GeladeiraProvider conta={conta}>
          <GeladeiraTela />
        </GeladeiraProvider>,
      );

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Não foi possível carregar sua Geladeira agora.",
      );

      await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));

      await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
      expect(buscar).toHaveBeenCalledTimes(2);
    });
  });

  describe("adicionar pela garrafa fantasma, sem sair da Geladeira", () => {
    const tocarFantasmaDeFrutas = async () => {
      const frutas = screen.getByRole("region", { name: "Frutas" });
      const fantasma = within(frutas).getAllByRole("button", { name: "Adicionar Frutas" })[0]!;
      await userEvent.click(fantasma);
      return fantasma;
    };

    it("a fantasma abre o diálogo 'Adicionar <categoria>' com as cervejas dela", async () => {
      abrir([cupuacu, mare]);

      await tocarFantasmaDeFrutas();

      const dialogo = screen.getByRole("dialog", { name: "Adicionar Frutas" });
      expect(within(dialogo).getByText("Cupuaçu Ale")).toBeInTheDocument();
      expect(within(dialogo).queryByText("Maré Alta")).not.toBeInTheDocument();
    });

    it("Adicionar fecha a lista, põe 1 unidade na prateleira e mostra o toast com Desfazer fora do diálogo", async () => {
      abrir([cupuacu]);
      await tocarFantasmaDeFrutas();

      await userEvent.click(screen.getByRole("button", { name: /^Adicionar$/ }));

      expect(screen.queryByRole("dialog", { name: "Adicionar Frutas" })).not.toBeInTheDocument();
      const frutas = screen.getByRole("region", { name: "Frutas" });
      expect(within(frutas).getByText("Cupuaçu Ale, 1 unidade, R$ 26,50")).toBeInTheDocument();
      const aviso = screen
        .getByText("Cupuaçu Ale foi para a geladeira")
        .closest<HTMLElement>("[role=status]")!;
      expect(aviso).toHaveTextContent("Cupuaçu Ale foi para a geladeira");
      expect(within(aviso).getByRole("button", { name: "Desfazer" })).toBeInTheDocument();
    });

    it("ao adicionar, o foco vai para a faixa da prateleira (a fantasma tocada some)", async () => {
      abrir([cupuacu]);
      await tocarFantasmaDeFrutas();

      await userEvent.click(screen.getByRole("button", { name: /^Adicionar$/ }));

      await waitFor(() =>
        expect(document.activeElement).toHaveAttribute("data-titulo-da-prateleira", "frutas"),
      );
    });

    it("fechar sem adicionar devolve o foco à fantasma tocada", async () => {
      abrir([cupuacu]);
      const fantasma = await tocarFantasmaDeFrutas();

      await userEvent.keyboard("{Escape}");

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(fantasma).toHaveFocus();
    });

    it("com 50 cervejas diferentes, a 51ª não entra: avisa 'A Geladeira está cheia.' e a lista continua aberta", async () => {
      guardar(
        Array.from({ length: 50 }, (_, i) => ({
          cerveja: { ...mare, id: `c${i}`, slug: `c${i}`, nome: `Cerveja ${i}` },
          quantidade: 1,
        })),
      );
      abrir([cupuacu]);
      const frutas = screen.getByRole("region", { name: "Frutas" });
      await userEvent.click(
        within(frutas).getAllByRole("button", { name: "Adicionar Frutas" })[0]!,
      );

      await userEvent.click(screen.getByRole("button", { name: /^Adicionar$/ }));

      expect(screen.getByRole("dialog", { name: "Adicionar Frutas" })).toBeInTheDocument();
      const aviso = screen.getByText("A Geladeira está cheia.").closest("[role=status]");
      expect(aviso).toBeInTheDocument();
      expect(screen.getByRole("dialog", { name: "Adicionar Frutas" })).not.toContainElement(
        aviso as HTMLElement,
      );
      expect(within(frutas).queryByText(/Cupuaçu Ale, 1 unidade/)).not.toBeInTheDocument();
    });
  });
});
