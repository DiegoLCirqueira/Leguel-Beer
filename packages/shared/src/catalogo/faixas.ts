export type Faixa = {
  id: string;
  rotulo: string;
  /** Limite inferior, incluído na faixa. */
  minimo: number;
  /** Limite superior, excluído da faixa. */
  maximo: number;
};

export const faixasDeFiltro = {
  teor: [] as Faixa[],
};

export function pertenceAFaixa(faixa: Faixa, valor: number): boolean {
  void faixa;
  void valor;
  return false;
}
