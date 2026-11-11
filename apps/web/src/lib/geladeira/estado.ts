import type { CervejaCard, GeladeiraRequest } from "@leguele/shared";

export type ItemLocal = { cerveja: CervejaCard; quantidade: number };
export type EstadoDaGeladeira = { itens: ItemLocal[] };
export type Resultado = { estado: EstadoDaGeladeira; limite?: number };

export const GELADEIRA_VAZIA: EstadoDaGeladeira = { itens: [] };

export function adicionar(
  estado: EstadoDaGeladeira,
  cerveja: CervejaCard,
  quantidade = 1,
): Resultado {
  void cerveja;
  void quantidade;
  return { estado };
}

export function alterarQuantidade(
  estado: EstadoDaGeladeira,
  cervejaId: string,
  quantidade: number,
): Resultado {
  void cervejaId;
  void quantidade;
  return { estado };
}

export function quantidadeTotal(estado: EstadoDaGeladeira): number {
  void estado;
  return 0;
}

export function paraRequest(estado: EstadoDaGeladeira): GeladeiraRequest {
  void estado;
  return { itens: [] };
}
