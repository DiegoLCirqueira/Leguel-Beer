import type { CervejaCard } from "@leguele/shared";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/geladeira" }));
import { CHAVE_DA_GELADEIRA } from "@/lib/geladeira/armazenamento";
import { GeladeiraProvider } from "./geladeira-provider";
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

const abrir = () =>
  render(
    <GeladeiraProvider>
      <GeladeiraTela />
    </GeladeiraProvider>,
  );

describe("GeladeiraTela", () => {
  it("vazia, mostra as 4 prateleiras só com garrafas fantasma", () => {
    abrir();

    expect(screen.getByRole("heading", { level: 1, name: "Geladeira" })).toBeInTheDocument();
    for (const categoria of ["IPA", "Frutas", "Malt", "Lager"]) {
      const prateleira = screen.getByRole("region", { name: categoria });
      expect(
        within(prateleira).getAllByRole("link", { name: `Adicionar ${categoria}` }),
      ).toHaveLength(4);
    }
  });

  it("com 2 Maré Alta, a faixa da IPA lê o rótulo e sobram 2 garrafas fantasma", () => {
    guardar([{ cerveja: mare, quantidade: 2 }]);
    abrir();

    const ipa = screen.getByRole("region", { name: "IPA" });
    expect(within(ipa).getByText("Maré Alta, 2 unidades, R$ 64,00")).toBeInTheDocument();
    expect(within(ipa).getAllByRole("link", { name: "Adicionar IPA" })).toHaveLength(2);
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
      expect(within(sheet).getByRole("button", { name: "Finalizar compra" })).toBeDisabled();
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

    it("'−' com 1 unidade não tira a cerveja; o Stepper muda a quantidade", async () => {
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
});
