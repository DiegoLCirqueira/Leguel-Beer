import type { Beer } from "./beer.js";

/** A cerveja com a situação dela no catálogo: ativa ou desativada. */
export interface BeerWithStatus {
  beer: Beer;
  active: boolean;
}

/** Porta de leitura do catálogo. */
export interface BeerRepository {
  /** Só as cervejas ativas (a inativa nunca aparece na vitrine). */
  findActive(): Promise<Beer[]>;
  /** A cerveja ativa com este slug; nula se não existe ou está inativa. */
  findActiveBySlug(slug: string): Promise<Beer | null>;
  /**
   * As cervejas que existem entre os ids pedidos, ativas ou desativadas (para quem guarda uma
   * referência, como a Geladeira). Id que não existe, ou que nem tem o formato de um id, não vem:
   * nunca é erro.
   */
  findByIds(ids: readonly string[]): Promise<BeerWithStatus[]>;
}
