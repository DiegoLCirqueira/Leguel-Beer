import { useState } from "react";

export type Animacao = "queda" | "balanco" | "saida";

export type GarrafaBase = { chave: string; cervejaId: string };

export type GarrafaAnimada<T extends GarrafaBase> = T & {
  animacao?: Animacao;
  /** Atraso em ms do balanço escalonado. */
  atraso: number;
};

type Efeito = { animacao: Animacao; atraso: number };
type Estado<T> = { assinatura: string; garrafas: T[]; efeitos: Map<string, Efeito> };

const ATRASO_DO_BALANCO_MS = 60;

/** O que mudou da lista anterior para a atual: o que entra cai e o rótulo que cresceu balança. */
function efeitosDaMudanca<T extends GarrafaBase>(anterior: T[], atual: T[]) {
  const conhecidas = new Set(anterior.map((g) => g.chave));
  const efeitos = new Map<string, Efeito>();
  const cresceram = new Set<string>();
  for (const g of atual) {
    if (conhecidas.has(g.chave)) continue;
    efeitos.set(g.chave, { animacao: "queda", atraso: 0 });
    cresceram.add(g.cervejaId);
  }
  const posicaoNoRotulo = new Map<string, number>();
  for (const g of atual) {
    if (!conhecidas.has(g.chave) || !cresceram.has(g.cervejaId)) continue;
    const posicao = posicaoNoRotulo.get(g.cervejaId) ?? 0;
    posicaoNoRotulo.set(g.cervejaId, posicao + 1);
    efeitos.set(g.chave, { animacao: "balanco", atraso: posicao * ATRASO_DO_BALANCO_MS });
  }
  return efeitos;
}

/**
 * Anima só a mudança: a garrafa que entra cai e as do rótulo que cresceu balançam. A primeira
 * leitura não anima, para a Geladeira abrir arrumada.
 */
export function useAnimacaoDasGarrafas<T extends GarrafaBase>(garrafas: T[]): GarrafaAnimada<T>[] {
  // Quem chama monta a lista a cada render: o que conta é o conteúdo, não a identidade do array.
  const assinatura = garrafas.map((g) => g.chave).join("|");
  const [anterior, setAnterior] = useState<Estado<T>>({
    assinatura,
    garrafas,
    efeitos: new Map(),
  });
  let atual = anterior;
  if (assinatura !== anterior.assinatura) {
    atual = { assinatura, garrafas, efeitos: efeitosDaMudanca(anterior.garrafas, garrafas) };
    setAnterior(atual);
  }
  return garrafas.map((g) => ({
    ...g,
    animacao: atual.efeitos.get(g.chave)?.animacao,
    atraso: atual.efeitos.get(g.chave)?.atraso ?? 0,
  }));
}
