export type Faixa = {
  id: string;
  rotulo: string;
  /** Limite inferior, incluído na faixa. */
  minimo: number;
  /** Limite superior, excluído da faixa. */
  maximo: number;
};

export const faixasDeFiltro = {
  teor: [
    { id: "abaixo-de-4-5", rotulo: "Abaixo de 4,5%", minimo: -Infinity, maximo: 4.5 },
    { id: "4-5-a-6", rotulo: "4,5% a menos de 6%", minimo: 4.5, maximo: 6 },
    { id: "6-ou-mais", rotulo: "6% ou mais", minimo: 6, maximo: Infinity },
  ] as Faixa[],
};

export function pertenceAFaixa(faixa: Faixa, valor: number): boolean {
  return valor >= faixa.minimo && valor < faixa.maximo;
}
