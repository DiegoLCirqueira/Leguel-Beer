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
  ibu: [
    { id: "abaixo-de-20", rotulo: "Abaixo de 20", minimo: -Infinity, maximo: 20 },
    { id: "20-a-40", rotulo: "20 a menos de 40", minimo: 20, maximo: 40 },
    { id: "40-ou-mais", rotulo: "40 ou mais", minimo: 40, maximo: Infinity },
  ] as Faixa[],
  /** Limites em centavos, a mesma unidade de `precoCentavos`. */
  preco: [
    { id: "abaixo-de-25", rotulo: "Abaixo de R$ 25", minimo: -Infinity, maximo: 2500 },
    { id: "25-a-30", rotulo: "R$ 25 a menos de R$ 30", minimo: 2500, maximo: 3000 },
    { id: "30-ou-mais", rotulo: "R$ 30 ou mais", minimo: 3000, maximo: Infinity },
  ] as Faixa[],
};

export function pertenceAFaixa(faixa: Faixa, valor: number): boolean {
  return valor >= faixa.minimo && valor < faixa.maximo;
}
