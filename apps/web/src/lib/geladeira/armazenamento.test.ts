import type { CervejaCard } from "@leguele/shared";
import { afterEach, describe, expect, it } from "vitest";
import {
  CHAVE_DA_GELADEIRA,
  apagarGeladeiraLocal,
  gravarGeladeiraLocal,
  lerGeladeiraLocal,
} from "./armazenamento";

const cerveja: CervejaCard = {
  id: "a",
  slug: "a",
  nome: "Cerveja a",
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

describe("armazenamento local da Geladeira", () => {
  afterEach(() => localStorage.clear());

  it("grava num formato versionado e lê de volta", () => {
    gravarGeladeiraLocal({ itens: [{ cerveja, quantidade: 2 }] });

    expect(JSON.parse(localStorage.getItem(CHAVE_DA_GELADEIRA) ?? "{}")).toMatchObject({
      versao: 1,
      itens: [{ quantidade: 2 }],
    });
    expect(lerGeladeiraLocal()).toEqual({ itens: [{ cerveja, quantidade: 2 }] });
  });

  it.each([
    ["sem nada gravado", null],
    ["JSON quebrado", "{isto não é json"],
    ["versão desconhecida", JSON.stringify({ versao: 2, itens: [] })],
    [
      "item com cerveja inválida",
      JSON.stringify({ versao: 1, itens: [{ cerveja: {}, quantidade: 1 }] }),
    ],
    ["quantidade zero", JSON.stringify({ versao: 1, itens: [{ cerveja, quantidade: 0 }] })],
    [
      "cerveja repetida",
      JSON.stringify({
        versao: 1,
        itens: [
          { cerveja, quantidade: 1 },
          { cerveja, quantidade: 1 },
        ],
      }),
    ],
  ])("%s vira Geladeira vazia, sem lançar", (_nome, bruto) => {
    if (bruto !== null) localStorage.setItem(CHAVE_DA_GELADEIRA, bruto);

    expect(lerGeladeiraLocal()).toEqual({ itens: [] });
  });

  it("apagar remove a cópia local", () => {
    gravarGeladeiraLocal({ itens: [{ cerveja, quantidade: 1 }] });

    apagarGeladeiraLocal();

    expect(localStorage.getItem(CHAVE_DA_GELADEIRA)).toBeNull();
    expect(lerGeladeiraLocal()).toEqual({ itens: [] });
  });

  it("com o armazenamento bloqueado nunca lança: lê vazio e grava sem efeito", () => {
    const original = Object.getOwnPropertyDescriptor(window, "localStorage");
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new Error("bloqueado");
      },
    });
    try {
      expect(() => gravarGeladeiraLocal({ itens: [{ cerveja, quantidade: 1 }] })).not.toThrow();
      expect(lerGeladeiraLocal()).toEqual({ itens: [] });
      expect(() => apagarGeladeiraLocal()).not.toThrow();
    } finally {
      if (original) Object.defineProperty(window, "localStorage", original);
    }
  });
});
