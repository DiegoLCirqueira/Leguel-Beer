import { useState } from "react";

export type Animacao = "queda" | "balanco" | "saida";

export type GarrafaBase = { chave: string; cervejaId: string };

export type GarrafaAnimada<T extends GarrafaBase> = T & {
  animacao?: Animacao;
  /** Atraso em ms do balanço escalonado. */
  atraso: number;
};

type Estado<T> = { assinatura: string; garrafas: T[]; animacoes: Map<string, Animacao> };

/**
 * Anima só a mudança: a garrafa que entra cai. A primeira leitura não anima, para a Geladeira abrir
 * arrumada.
 */
export function useAnimacaoDasGarrafas<T extends GarrafaBase>(garrafas: T[]): GarrafaAnimada<T>[] {
  // Quem chama monta a lista a cada render: o que conta é o conteúdo, não a identidade do array.
  const assinatura = garrafas.map((g) => g.chave).join("|");
  const [anterior, setAnterior] = useState<Estado<T>>({
    assinatura,
    garrafas,
    animacoes: new Map(),
  });
  let atual = anterior;
  if (assinatura !== anterior.assinatura) {
    const conhecidas = new Set(anterior.garrafas.map((g) => g.chave));
    const animacoes = new Map<string, Animacao>();
    for (const g of garrafas) if (!conhecidas.has(g.chave)) animacoes.set(g.chave, "queda");
    atual = { assinatura, garrafas, animacoes };
    setAnterior(atual);
  }
  return garrafas.map((g) => ({ ...g, animacao: atual.animacoes.get(g.chave), atraso: 0 }));
}
