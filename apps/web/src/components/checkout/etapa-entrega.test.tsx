import type { CervejaCard, EnderecoResposta, GeladeiraResponse } from "@leguele/shared";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const trocar = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  usePathname: () => "/checkout",
  useRouter: () => ({ replace: trocar }),
}));
import type { ResultadoDoFrete } from "@/app/geladeira/frete";
import { CHAVE_DA_GELADEIRA } from "@/lib/geladeira/armazenamento";
import type { ContaDaGeladeira } from "@/lib/geladeira/conta";
import { GeladeiraProvider } from "@/components/geladeira/geladeira-provider";
import { EtapaEntrega } from "./etapa-entrega";

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

const endereco = (extra: Partial<EnderecoResposta>): EnderecoResposta => ({
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
  ...extra,
});
const casa = endereco({});
const trabalho = endereco({ id: "trabalho", apelido: "Trabalho", padrao: false });

const frete = (f: Extract<ResultadoDoFrete, { tipo: "frete" }>["frete"]): ResultadoDoFrete => ({
  tipo: "frete",
  frete: f,
});

afterEach(() => {
  localStorage.clear();
  trocar.mockReset();
});

const abrir = (
  enderecos: EnderecoResposta[],
  cotarFrete: (id: string) => Promise<ResultadoDoFrete>,
) => {
  localStorage.setItem(
    CHAVE_DA_GELADEIRA,
    JSON.stringify({ versao: 1, itens: [{ cerveja: mare, quantidade: 2 }] }),
  );
  return render(
    <GeladeiraProvider>
      <EtapaEntrega
        enderecos={enderecos}
        cotarFrete={cotarFrete}
        destinoDoPagamento="/checkout/pagamento"
      />
    </GeladeiraProvider>,
  );
};

describe("EtapaEntrega", () => {
  it("lista os endereços com o padrão selecionado e cota o frete dele", async () => {
    const cotar = vi.fn().mockResolvedValue(frete({ tipo: "valor", centavos: 1300 }));
    abrir([casa, trabalho], cotar);

    expect(screen.getByRole("heading", { level: 1, name: "Finalizar pedido" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Casa/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Trabalho/ })).not.toBeChecked();
    expect(await screen.findByText("R$ 13,00")).toBeInTheDocument();
    expect(cotar).toHaveBeenCalledWith("casa");
    expect(screen.getByText("R$ 77,00")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Continuar para pagamento" })).toHaveAttribute(
      "href",
      "/checkout/pagamento",
    );
  });

  it("escolher outro endereço cota o frete dele, só para este pedido", async () => {
    const cotar = vi
      .fn()
      .mockResolvedValueOnce(frete({ tipo: "valor", centavos: 1300 }))
      .mockResolvedValueOnce(frete({ tipo: "gratis" }));
    abrir([casa, trabalho], cotar);
    await screen.findByText("R$ 13,00");

    await userEvent.click(screen.getByRole("radio", { name: /Trabalho/ }));

    expect(await screen.findByText("Grátis")).toBeInTheDocument();
    expect(cotar).toHaveBeenLastCalledWith("trabalho");
    expect(screen.getByRole("radio", { name: /Trabalho/ })).toBeChecked();
  });

  it("fora da área: avisa, oferece Alterar endereço e Voltar ao catálogo e não deixa continuar", async () => {
    abrir(
      [endereco({ foraDaArea: true })],
      vi.fn().mockResolvedValue(frete({ tipo: "fora-da-area" })),
    );

    expect(await screen.findAllByText("Ainda não entregamos neste endereço")).not.toHaveLength(0);
    expect(screen.getByRole("link", { name: "Alterar endereço" })).toHaveAttribute(
      "href",
      "/conta/enderecos",
    );
    expect(screen.getByRole("link", { name: "Voltar ao catálogo" })).toHaveAttribute(
      "href",
      "/catalogo",
    );
    expect(
      screen.queryByRole("link", { name: "Continuar para pagamento" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar para pagamento" })).toBeDisabled();
  });

  it("sem conseguir cotar, avisa e não deixa continuar", async () => {
    abrir([casa], vi.fn().mockResolvedValue(frete({ tipo: "indisponivel" })));

    expect(
      await screen.findByText(
        "Não conseguimos calcular o frete agora. Tente de novo em instantes.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar para pagamento" })).toBeDisabled();
  });

  it("sem endereço salvo, pede para cadastrar um", () => {
    const cotar = vi.fn();
    abrir([], cotar);

    expect(screen.getByText("Cadastre um endereço para continuar.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Adicionar endereço" })).toHaveAttribute(
      "href",
      "/conta/enderecos/novo",
    );
    expect(cotar).not.toHaveBeenCalled();
  });

  it("'Adicionar novo endereço' leva a Meus endereços e 'Ver resumo' à Geladeira", async () => {
    abrir([casa], vi.fn().mockResolvedValue(frete({ tipo: "gratis" })));
    await waitFor(() => expect(screen.getByText("Grátis")).toBeInTheDocument());

    expect(screen.getByRole("link", { name: "Adicionar novo endereço" })).toHaveAttribute(
      "href",
      "/conta/enderecos/novo",
    );
    expect(screen.getByRole("link", { name: "Ver resumo" })).toHaveAttribute("href", "/geladeira");
    expect(screen.getByText("2 itens na sua geladeira")).toBeInTheDocument();
  });

  it("sem destino de pagamento ainda, o botão fica desabilitado mesmo com frete", async () => {
    localStorage.setItem(
      CHAVE_DA_GELADEIRA,
      JSON.stringify({ versao: 1, itens: [{ cerveja: mare, quantidade: 2 }] }),
    );
    render(
      <GeladeiraProvider>
        <EtapaEntrega
          enderecos={[casa]}
          cotarFrete={vi.fn().mockResolvedValue(frete({ tipo: "gratis" }))}
        />
      </GeladeiraProvider>,
    );

    await screen.findByText("Grátis");
    expect(screen.getByRole("button", { name: "Continuar para pagamento" })).toBeDisabled();
    expect(
      screen.queryByRole("link", { name: "Continuar para pagamento" }),
    ).not.toBeInTheDocument();
  });

  it("com a Geladeira vazia, leva à Geladeira e não cota nem deixa continuar", async () => {
    const cotar = vi.fn().mockResolvedValue(frete({ tipo: "gratis" }));
    render(
      <GeladeiraProvider>
        <EtapaEntrega
          enderecos={[casa]}
          cotarFrete={cotar}
          destinoDoPagamento="/checkout/pagamento"
        />
      </GeladeiraProvider>,
    );

    await waitFor(() => expect(trocar).toHaveBeenCalledWith("/geladeira"));
    expect(cotar).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("link", { name: "Continuar para pagamento" }),
    ).not.toBeInTheDocument();
  });

  it("não cota antes de a conta receber a Geladeira local; cota de novo quando recebe", async () => {
    localStorage.setItem(
      CHAVE_DA_GELADEIRA,
      JSON.stringify({ versao: 1, itens: [{ cerveja: mare, quantidade: 2 }] }),
    );
    const resposta = (quantidade: number): GeladeiraResponse => ({
      itens: quantidade
        ? [{ cerveja: mare, quantidade, totalCentavos: quantidade * mare.precoCentavos }]
        : [],
      ajustes: [],
      quantidadeTotal: quantidade,
      subtotalCentavos: quantidade * mare.precoCentavos,
    });
    let enviado = false;
    const conta: ContaDaGeladeira = {
      buscar: async () => ({ tipo: "ok", resposta: resposta(0) }),
      enviar: async () => {
        enviado = true;
        return { tipo: "ok", resposta: resposta(2) };
      },
      validar: async () => ({ tipo: "erro" }),
    };
    // A API cota com a Geladeira da conta: antes do envio ela está vazia.
    const cotar = vi.fn(async () =>
      frete(enviado ? { tipo: "gratis" } : { tipo: "valor", centavos: 300 }),
    );
    render(
      <GeladeiraProvider conta={conta}>
        <EtapaEntrega
          enderecos={[casa]}
          cotarFrete={cotar}
          destinoDoPagamento="/checkout/pagamento"
        />
      </GeladeiraProvider>,
    );

    expect(await screen.findByText("Grátis")).toBeInTheDocument();
    expect(screen.queryByText("R$ 3,00")).not.toBeInTheDocument();
  });

  it("o HTML do servidor não traz a contagem de itens, que só a cópia local conhece (sem divergir na hidratação)", () => {
    localStorage.setItem(
      CHAVE_DA_GELADEIRA,
      JSON.stringify({ versao: 1, itens: [{ cerveja: mare, quantidade: 2 }] }),
    );

    const html = renderToString(
      <GeladeiraProvider>
        <EtapaEntrega enderecos={[casa]} cotarFrete={vi.fn()} destinoDoPagamento="/x" />
      </GeladeiraProvider>,
    );

    expect(html).not.toContain("2 itens");
  });
});
