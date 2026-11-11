import type { EstadoDaGeladeira } from "./estado";

export const CHAVE_DA_GELADEIRA = "lb:geladeira";

export function lerGeladeiraLocal(): EstadoDaGeladeira {
  return { itens: [] };
}

export function gravarGeladeiraLocal(estado: EstadoDaGeladeira): void {
  void estado;
}

export function apagarGeladeiraLocal(): void {}
