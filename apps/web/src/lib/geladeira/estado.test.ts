import type { CervejaCard, GeladeiraResponse } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import {
  GELADEIRA_VAZIA,
  adicionar,
  alterarQuantidade,
  aplicarResposta,
  desfazer,
  paraRequest,
  remover,
  quantidadeTotal,
} from "./estado";

const cerveja = (id: string, extra: Partial<CervejaCard> = {}): CervejaCard => ({
  id,
  slug: id,
  nome: `Cerveja ${id}`,
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
  ...extra,
});

describe("adicionar", () => {
  it("põe a cerveja com uma unidade e soma nas toques seguintes, na ordem de entrada", () => {
    const a = cerveja("a");
    const b = cerveja("b");

    let { estado } = adicionar(GELADEIRA_VAZIA, a);
    ({ estado } = adicionar(estado, b));
    ({ estado } = adicionar(estado, a));

    expect(estado.itens.map((i) => [i.cerveja.id, i.quantidade])).toEqual([
      ["a", 2],
      ["b", 1],
    ]);
  });

  it("não passa da quantidade disponível: nada muda e devolve o limite", () => {
    const a = cerveja("a", { quantidadeDisponivel: 2 });
    let { estado } = adicionar(GELADEIRA_VAZIA, a, 2);

    const resultado = adicionar(estado, a);
    estado = resultado.estado;

    expect(estado.itens[0]?.quantidade).toBe(2);
    expect(resultado.limite).toBe(2);
  });

  it("nunca passa de 99 por cerveja, mesmo com muito estoque", () => {
    const a = cerveja("a", { quantidadeDisponivel: 500 });

    const resultado = adicionar(GELADEIRA_VAZIA, a, 120);

    expect(resultado.estado.itens[0]?.quantidade).toBe(99);
    expect(resultado.limite).toBe(99);
  });

  it("esgotada não entra (limite 0)", () => {
    const a = cerveja("a", { esgotada: true, quantidadeDisponivel: 0 });

    const resultado = adicionar(GELADEIRA_VAZIA, a);

    expect(resultado.estado.itens).toEqual([]);
    expect(resultado.limite).toBe(0);
  });

  it("não passa de 50 cervejas diferentes", () => {
    let estado = GELADEIRA_VAZIA;
    for (let i = 0; i < 50; i++) ({ estado } = adicionar(estado, cerveja(`c${i}`)));

    const resultado = adicionar(estado, cerveja("extra"));

    expect(resultado.estado.itens).toHaveLength(50);
    expect(resultado.limite).toBe(0);
  });
});

describe("alterarQuantidade", () => {
  it("muda a quantidade da cerveja, de 1 até a disponível", () => {
    const a = cerveja("a", { quantidadeDisponivel: 4 });
    const { estado } = adicionar(GELADEIRA_VAZIA, a);

    expect(alterarQuantidade(estado, "a", 3).estado.itens[0]?.quantidade).toBe(3);
    const acima = alterarQuantidade(estado, "a", 9);
    expect(acima.estado.itens[0]?.quantidade).toBe(1);
    expect(acima.limite).toBe(4);
  });

  it("cerveja que não está na Geladeira não muda nada", () => {
    const { estado } = adicionar(GELADEIRA_VAZIA, cerveja("a"));

    expect(alterarQuantidade(estado, "x", 2).estado).toEqual(estado);
  });
});

describe("quantidadeTotal e paraRequest", () => {
  it("o total soma as unidades e o pedido leva o preço visto, na ordem de entrada", () => {
    let { estado } = adicionar(GELADEIRA_VAZIA, cerveja("a"), 2);
    ({ estado } = adicionar(estado, cerveja("b", { precoCentavos: 2650 })));

    expect(quantidadeTotal(estado)).toBe(3);
    expect(paraRequest(estado)).toEqual({
      itens: [
        { cervejaId: "a", quantidade: 2, precoVistoCentavos: 3200 },
        { cervejaId: "b", quantidade: 1, precoVistoCentavos: 2650 },
      ],
    });
  });

  it("Geladeira vazia soma 0", () => {
    expect(quantidadeTotal(GELADEIRA_VAZIA)).toBe(0);
  });
});

describe("remover e desfazer", () => {
  const tres = () => {
    let { estado } = adicionar(GELADEIRA_VAZIA, cerveja("a"), 2);
    ({ estado } = adicionar(estado, cerveja("b")));
    ({ estado } = adicionar(estado, cerveja("c"), 3));
    return estado;
  };

  it("remover tira a cerveja e guarda o que precisa para desfazer, com a posição", () => {
    const { estado, desfazer: d } = remover(tres(), "b");

    expect(estado.itens.map((i) => i.cerveja.id)).toEqual(["a", "c"]);
    expect(d?.posicao).toBe(1);
    expect(d?.item.quantidade).toBe(1);
  });

  it("desfazer devolve a cerveja com a quantidade e na mesma posição", () => {
    const { estado, desfazer: d } = remover(tres(), "a");

    const volta = desfazer(estado, d!);

    expect(volta.itens.map((i) => [i.cerveja.id, i.quantidade])).toEqual([
      ["a", 2],
      ["b", 1],
      ["c", 3],
    ]);
  });

  it("remover cerveja que não está na Geladeira não muda nada e não há o que desfazer", () => {
    const antes = tres();

    const { estado, desfazer: d } = remover(antes, "x");

    expect(estado).toEqual(antes);
    expect(d).toBeNull();
  });
});

describe("aplicarResposta", () => {
  it("a Geladeira passa a ser a que a API devolveu: itens validados, na ordem de entrada, sem os removidos", () => {
    const a = cerveja("a", { precoCentavos: 3000 });
    const c = cerveja("c");
    let { estado } = adicionar(GELADEIRA_VAZIA, cerveja("a"), 2);
    ({ estado } = adicionar(estado, cerveja("b")));
    ({ estado } = adicionar(estado, c));
    const resposta: GeladeiraResponse = {
      itens: [
        { cerveja: a, quantidade: 2, totalCentavos: 6000 },
        { cerveja: c, quantidade: 1, totalCentavos: 3200 },
      ],
      ajustes: [],
      quantidadeTotal: 3,
      subtotalCentavos: 9200,
    };

    const novo = aplicarResposta(estado, resposta);

    expect(novo.itens.map((i) => [i.cerveja.id, i.cerveja.precoCentavos, i.quantidade])).toEqual([
      ["a", 3000, 2],
      ["c", 3200, 1],
    ]);
  });
});
