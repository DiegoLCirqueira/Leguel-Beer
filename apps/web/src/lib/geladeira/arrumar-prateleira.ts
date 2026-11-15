/** Uma cerveja na prateleira: o que a arrumação precisa saber dela. */
export type RotuloDaPrateleira = { cervejaId: string; nome: string; quantidade: number };

/** Uma garrafa desenhada: `coluna` de 0 a 3 e `fileira` 0 na frente, 1 e 2 atrás. */
export type GarrafaArrumada = { chave: string; cervejaId: string; coluna: number; fileira: number };

export type PrateleiraArrumada = {
  garrafas: GarrafaArrumada[];
  /** Colunas livres, onde vai a garrafa fantasma. */
  fantasmas: number[];
  /** Os rótulos da faixa, na ordem de entrada, cada um com a coluna em que a faixa o mostra. */
  rotulos: (RotuloDaPrateleira & { coluna: number })[];
};

const COLUNAS = 4;
/** Profundidade desenhada; o que passa disso não aparece (a faixa mostra o total). */
const FILEIRAS_DESENHADAS = 3;

/** Posição de cada garrafa: um rótulo só se espalha pelas colunas e depois para trás; vários viram filas. */
export function arrumarPrateleira(itens: RotuloDaPrateleira[]): PrateleiraArrumada {
  const unico = itens.length === 1;
  const garrafas = itens.slice(0, COLUNAS).flatMap((item, indice) =>
    Array.from({ length: item.quantidade }, (_, k) => ({
      chave: `${item.cervejaId}#${k}`,
      cervejaId: item.cervejaId,
      coluna: unico ? k % COLUNAS : indice,
      fileira: unico ? Math.floor(k / COLUNAS) : k,
    })).filter((g) => g.fileira < FILEIRAS_DESENHADAS),
  );
  const ocupadas = unico
    ? Math.min(itens[0]!.quantidade, COLUNAS)
    : Math.min(itens.length, COLUNAS);
  const fantasmas = Array.from({ length: COLUNAS - ocupadas }, (_, i) => ocupadas + i);
  const rotulos = itens
    .slice(0, COLUNAS)
    .map((item, indice) => ({ ...item, coluna: unico ? 0 : indice }));
  return { garrafas, fantasmas, rotulos };
}
