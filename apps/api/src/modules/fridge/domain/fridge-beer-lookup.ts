import type { Beer } from "../../catalog/domain/beer.js";

/** Cerveja como a Geladeira a vê: a ficha do catálogo mais a situação (ativa ou desativada). */
export interface FridgeBeer {
  beer: Beer;
  active: boolean;
}

/** Porta de leitura da Geladeira: a situação atual das cervejas pedidas, ativas ou não. */
export interface FridgeBeerLookup {
  /**
   * As cervejas que existem entre os ids pedidos, ativas ou desativadas. Id que não existe (ou que
   * nem tem o formato de um id) simplesmente não vem: nunca é erro.
   */
  findByIds(ids: readonly string[]): Promise<FridgeBeer[]>;
}
