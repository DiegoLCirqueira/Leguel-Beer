import type { Beer } from "./beer.js";

/** Porta de leitura do catálogo: só as cervejas ativas (a inativa nunca aparece). */
export interface BeerRepository {
  findActive(): Promise<Beer[]>;
}
