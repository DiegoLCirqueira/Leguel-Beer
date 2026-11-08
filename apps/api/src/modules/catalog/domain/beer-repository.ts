import type { Beer } from "./beer.js";

/** Porta de leitura do catálogo: só as cervejas ativas (a inativa nunca aparece). */
export interface BeerRepository {
  findActive(): Promise<Beer[]>;
  /** A cerveja ativa com este slug; nula se não existe ou está inativa. */
  findActiveBySlug(slug: string): Promise<Beer | null>;
}
