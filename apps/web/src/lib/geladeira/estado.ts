import {
  ITENS_MAXIMOS_NA_GELADEIRA,
  QUANTIDADE_MAXIMA_POR_ITEM,
  type CervejaCard,
  type GeladeiraRequest,
} from "@leguele/shared";

export type ItemLocal = { cerveja: CervejaCard; quantidade: number };
export type EstadoDaGeladeira = { itens: ItemLocal[] };
/** `limite` vem quando o pedido passou do que cabe: nada muda e o limite alimenta o "Só temos N unidades". */
export type Resultado = { estado: EstadoDaGeladeira; limite?: number };

export const GELADEIRA_VAZIA: EstadoDaGeladeira = { itens: [] };

/** Até onde a cerveja pode ir: a quantidade disponível, no máximo 99 (0 se esgotada). */
const tetoDaCerveja = (cerveja: CervejaCard) =>
  cerveja.esgotada ? 0 : Math.min(cerveja.quantidadeDisponivel, QUANTIDADE_MAXIMA_POR_ITEM);

/** Soma `quantidade` à cerveja (entra no fim da lista se for nova), respeitando os limites. */
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
  const nova = Math.min((atual?.quantidade ?? 0) + quantidade, teto);
  if (atual && nova === atual.quantidade) return { estado, limite: teto };
  const item: ItemLocal = { cerveja, quantidade: nova };
  const itens = atual
    ? estado.itens.map((i) => (i.cerveja.id === cerveja.id ? item : i))
    : [...estado.itens, item];
  return {
    estado: { itens },
    limite: nova < (atual?.quantidade ?? 0) + quantidade ? teto : undefined,
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
