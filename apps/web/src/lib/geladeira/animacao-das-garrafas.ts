export type Animacao = "queda" | "balanco" | "saida";

export type GarrafaBase = { chave: string; cervejaId: string };

export type GarrafaAnimada<T extends GarrafaBase> = T & {
  animacao?: Animacao;
  /** Atraso em ms do balanço escalonado. */
  atraso: number;
};

/** Esqueleto: devolve as garrafas sem animação. */
export function useAnimacaoDasGarrafas<T extends GarrafaBase>(garrafas: T[]): GarrafaAnimada<T>[] {
  return garrafas.map((g) => ({ ...g, atraso: 0 }));
}
