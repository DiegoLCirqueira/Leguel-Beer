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

export function arrumarPrateleira(_itens: RotuloDaPrateleira[]): PrateleiraArrumada {
  return { garrafas: [], fantasmas: [], rotulos: [] };
}
