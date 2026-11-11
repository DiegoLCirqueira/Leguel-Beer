import type { CervejaCard } from "@leguele/shared";
import { describe, expect, it } from "vitest";
import { resolverAoEntrar } from "./ao-entrar";
import type { EstadoDaGeladeira } from "./estado";

const cerveja = (id: string): CervejaCard => ({
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
});

const com = (id: string, quantidade: number): EstadoDaGeladeira => ({
  itens: [{ cerveja: cerveja(id), quantidade }],
});
const vazia: EstadoDaGeladeira = { itens: [] };

describe("resolverAoEntrar", () => {
  it("conta vazia e convidado com itens: a do convidado passa para a conta", () => {
    const convidado = com("a", 2);

    expect(resolverAoEntrar({ convidado, conta: vazia })).toEqual({
      geladeira: convidado,
      enviarParaConta: true,
    });
  });

  it("conta com itens: vale a da conta e a do convidado é descartada", () => {
    const conta = com("b", 1);

    expect(resolverAoEntrar({ convidado: com("a", 2), conta })).toEqual({
      geladeira: conta,
      enviarParaConta: false,
    });
  });

  it("as duas vazias: continua vazia e não há o que enviar", () => {
    expect(resolverAoEntrar({ convidado: vazia, conta: vazia })).toEqual({
      geladeira: vazia,
      enviarParaConta: false,
    });
  });
});
