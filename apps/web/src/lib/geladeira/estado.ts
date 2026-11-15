import {
  ITENS_MAXIMOS_NA_GELADEIRA,
  QUANTIDADE_MAXIMA_POR_ITEM,
  type CervejaCard,
  type GeladeiraRequest,
  type GeladeiraResponse,
} from "@leguele/shared";

export type ItemLocal = { cerveja: CervejaCard; quantidade: number };
export type EstadoDaGeladeira = { itens: ItemLocal[] };
/** `limite` vem quando o pedido passou do que cabe: nada muda e o limite alimenta o "Só temos N unidades". */
export type Resultado = { estado: EstadoDaGeladeira; limite?: number };

/** O aviso de limite: "Só temos N unidades" (singular com 1); sem lugar (limite 0), "A Geladeira está cheia.". */
export const mensagemDoLimite = (limite: number) =>
  limite === 0
    ? "A Geladeira está cheia."
    : `Só temos ${limite} ${limite === 1 ? "unidade" : "unidades"}`;

export const GELADEIRA_VAZIA: EstadoDaGeladeira = { itens: [] };

/** Até onde a cerveja pode ir: a quantidade disponível, no máximo 99 (0 se esgotada). */
const tetoDaCerveja = (cerveja: CervejaCard) =>
  cerveja.esgotada ? 0 : Math.min(cerveja.quantidadeDisponivel, QUANTIDADE_MAXIMA_POR_ITEM);

/** Soma `quantidade` à cerveja (entra no fim da lista se for nova); se passar dos limites, recusa e nada muda. */
export function adicionar(
  estado: EstadoDaGeladeira,
  cerveja: CervejaCard,
  quantidade = 1,
): Resultado {
  const teto = tetoDaCerveja(cerveja);
  const atual = estado.itens.find((i) => i.cerveja.id === cerveja.id);
  if (!atual && (teto === 0 || estado.itens.length >= ITENS_MAXIMOS_NA_GELADEIRA)) {
    return { estado, limite: 0 };
  }
  if (teto === 0) return { estado, limite: 0 };
  // A soma que passa do teto é recusada inteira: nada muda (sem adição parcial).
  const nova = (atual?.quantidade ?? 0) + quantidade;
  if (nova > teto) return { estado, limite: teto };
  const item: ItemLocal = { cerveja, quantidade: nova };
  const itens = atual
    ? estado.itens.map((i) => (i.cerveja.id === cerveja.id ? item : i))
    : [...estado.itens, item];
  return { estado: { itens } };
}

/**
 * Desfaz uma adição só daquela cerveja: volta à quantidade de `antes` (0 tira a cerveja). Só mexe se a
 * cerveja ainda está com a quantidade de `depois` do toque; se a Geladeira mudou (por exemplo, a conta
 * chegou), não toca em nada.
 */
export function reverterAdicao(
  estado: EstadoDaGeladeira,
  cervejaId: string,
  { antes, depois }: { antes: number; depois: number },
): EstadoDaGeladeira {
  const atual = estado.itens.find((i) => i.cerveja.id === cervejaId);
  if (!atual || atual.quantidade !== depois) return estado;
  if (antes === 0) return { itens: estado.itens.filter((i) => i.cerveja.id !== cervejaId) };
  return {
    itens: estado.itens.map((i) => (i.cerveja.id === cervejaId ? { ...i, quantidade: antes } : i)),
  };
}

/** Troca a quantidade de uma cerveja que já está na Geladeira (de 1 até o que cabe). */
export function alterarQuantidade(
  estado: EstadoDaGeladeira,
  cervejaId: string,
  quantidade: number,
): Resultado {
  const atual = estado.itens.find((i) => i.cerveja.id === cervejaId);
  if (!atual) return { estado };
  const teto = tetoDaCerveja(atual.cerveja);
  if (quantidade > teto) return { estado, limite: teto };
  if (quantidade < 1) return { estado };
  return {
    estado: {
      itens: estado.itens.map((i) => (i.cerveja.id === cervejaId ? { ...i, quantidade } : i)),
    },
  };
}

export function quantidadeTotal(estado: EstadoDaGeladeira): number {
  return estado.itens.reduce((soma, i) => soma + i.quantidade, 0);
}

/** O que o site manda à API: cada cerveja com a quantidade e o preço que a pessoa viu. */
export function paraRequest(estado: EstadoDaGeladeira): GeladeiraRequest {
  return {
    itens: estado.itens.map((i) => ({
      cervejaId: i.cerveja.id,
      quantidade: i.quantidade,
      precoVistoCentavos: i.cerveja.precoCentavos,
    })),
  };
}

export type Desfazer = { item: ItemLocal; posicao: number };

/** Tira a cerveja da Geladeira e devolve o que "Desfazer" precisa: o item e a posição em que estava. */
export function remover(
  estado: EstadoDaGeladeira,
  cervejaId: string,
): { estado: EstadoDaGeladeira; desfazer: Desfazer | null } {
  const posicao = estado.itens.findIndex((i) => i.cerveja.id === cervejaId);
  const item = estado.itens[posicao];
  if (!item) return { estado, desfazer: null };
  return {
    estado: { itens: estado.itens.filter((i) => i.cerveja.id !== cervejaId) },
    desfazer: { item, posicao },
  };
}

/** Devolve a cerveja removida, com a quantidade e na posição de antes (se já voltou, não duplica). */
export function desfazer(estado: EstadoDaGeladeira, d: Desfazer): EstadoDaGeladeira {
  if (estado.itens.some((i) => i.cerveja.id === d.item.cerveja.id)) return estado;
  const itens = [...estado.itens];
  itens.splice(Math.min(d.posicao, itens.length), 0, d.item);
  return { itens };
}

/** A Geladeira passa a ser a que a API validou: preços e quantidades certos, sem as cervejas removidas. */
export function aplicarResposta(
  _estado: EstadoDaGeladeira,
  resposta: GeladeiraResponse,
): EstadoDaGeladeira {
  return { itens: resposta.itens.map((i) => ({ cerveja: i.cerveja, quantidade: i.quantidade })) };
}
