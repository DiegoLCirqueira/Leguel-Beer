import { useEffect, useState } from "react";

export type Animacao = "queda" | "balanco" | "saida";

export type GarrafaBase = { chave: string; cervejaId: string };

export type GarrafaAnimada<T extends GarrafaBase> = T & {
  animacao?: Animacao;
  /** Atraso em ms do balanço escalonado. */
  atraso: number;
  /** Muda a cada mudança que anima a garrafa: quem usa como `key` reinicia a animação CSS. */
  rodada: number;
};

type Efeito = { animacao: Animacao; atraso: number };
type Estado<T> = {
  assinatura: string;
  garrafas: T[];
  efeitos: Map<string, Efeito>;
  /** Quantas mudanças já animaram. */
  rodada: number;
  /** Garrafas que saíram e ainda estão na tela, saindo. */
  saindo: T[];
};

const ATRASO_DO_BALANCO_MS = 60;
const DURACAO_DA_SAIDA_MS = 300;

const movimentoReduzido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
 * leitura não anima, para a Geladeira abrir arrumada. A garrafa que sai fica 300 ms, saindo.
 * Com movimento reduzido nada anima: a garrafa só aparece e some.
 */
export function useAnimacaoDasGarrafas<T extends GarrafaBase>(garrafas: T[]): GarrafaAnimada<T>[] {
  // Quem chama monta a lista a cada render: o que conta é o conteúdo, não a identidade do array.
  const assinatura = garrafas.map((g) => g.chave).join("|");
  const [anterior, setAnterior] = useState<Estado<T>>({
    assinatura,
    garrafas,
    efeitos: new Map(),
    rodada: 0,
    saindo: [],
  });
  let atual = anterior;
  if (assinatura !== anterior.assinatura) {
    const chaves = new Set(garrafas.map((g) => g.chave));
    const saindo = [...anterior.saindo, ...anterior.garrafas].filter((g) => !chaves.has(g.chave));
    const semMovimento = movimentoReduzido();
    atual = {
      assinatura,
      garrafas,
      efeitos: semMovimento ? new Map() : efeitosDaMudanca(anterior.garrafas, garrafas),
      rodada: anterior.rodada + 1,
      saindo: semMovimento ? [] : [...new Map(saindo.map((g) => [g.chave, g])).values()],
    };
    setAnterior(atual);
  }
  const saindo = atual.saindo;
  useEffect(() => {
    if (saindo.length === 0) return;
    const timer = setTimeout(
      () => setAnterior((s) => (s.saindo === saindo ? { ...s, saindo: [] } : s)),
      DURACAO_DA_SAIDA_MS,
    );
    return () => clearTimeout(timer);
  }, [saindo]);
  return [
    ...garrafas.map((g) => ({
      ...g,
      animacao: atual.efeitos.get(g.chave)?.animacao,
      atraso: atual.efeitos.get(g.chave)?.atraso ?? 0,
      rodada: atual.efeitos.has(g.chave) ? atual.rodada : 0,
    })),
    ...saindo.map((g) => ({ ...g, animacao: "saida" as const, atraso: 0, rodada: atual.rodada })),
  ];
}
