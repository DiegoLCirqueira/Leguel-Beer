import {
  ITENS_MAXIMOS_NA_GELADEIRA,
  QUANTIDADE_MAXIMA_POR_ITEM,
  cervejaCardSchema,
} from "@leguele/shared";
import type { EstadoDaGeladeira } from "./estado";

export const CHAVE_DA_GELADEIRA = "lb:geladeira";

/**
 * Valida o formato gravado, `{ versao: 1, itens: [{ cerveja, quantidade }] }`, com o schema da
 * cerveja de `@leguele/shared`; o preço visto é o da própria cerveja. Devolve `undefined` se inválido.
 */
function validar(bruto: unknown): EstadoDaGeladeira | undefined {
  if (typeof bruto !== "object" || bruto === null) return undefined;
  const { versao, itens } = bruto as { versao?: unknown; itens?: unknown };
  if (versao !== 1 || !Array.isArray(itens) || itens.length > ITENS_MAXIMOS_NA_GELADEIRA) {
    return undefined;
  }
  const lidos: EstadoDaGeladeira["itens"] = [];
  for (const item of itens as { cerveja?: unknown; quantidade?: unknown }[]) {
    const cerveja = cervejaCardSchema.safeParse(item?.cerveja);
    const { quantidade } = item ?? {};
    if (
      !cerveja.success ||
      !Number.isInteger(quantidade) ||
      (quantidade as number) < 1 ||
      (quantidade as number) > QUANTIDADE_MAXIMA_POR_ITEM
    ) {
      return undefined;
    }
    lidos.push({ cerveja: cerveja.data, quantidade: quantidade as number });
  }
  return new Set(lidos.map((l) => l.cerveja.id)).size === lidos.length
    ? { itens: lidos }
    : undefined;
}

const VAZIA: EstadoDaGeladeira = { itens: [] };

/** Lê a cópia local; formato desconhecido ou inválido, ou armazenamento bloqueado, vira Geladeira vazia. */
export function lerGeladeiraLocal(): EstadoDaGeladeira {
  try {
    const bruto = window.localStorage.getItem(CHAVE_DA_GELADEIRA);
    if (bruto === null) return VAZIA;
    return validar(JSON.parse(bruto)) ?? VAZIA;
  } catch {
    return VAZIA;
  }
}

export function gravarGeladeiraLocal(estado: EstadoDaGeladeira): void {
  try {
    window.localStorage.setItem(
      CHAVE_DA_GELADEIRA,
      JSON.stringify({ versao: 1, itens: estado.itens }),
    );
  } catch {
    // Armazenamento bloqueado ou cheio: a Geladeira segue na memória desta sessão.
  }
}

export function apagarGeladeiraLocal(): void {
  try {
    window.localStorage.removeItem(CHAVE_DA_GELADEIRA);
  } catch {
    // Armazenamento bloqueado: não há cópia para apagar.
  }
}

export const CHAVE_DA_CONTA = "lb:geladeira-da-conta";
export const CHAVE_PENDENTE = "lb:geladeira-pendente";

/** Marcas de sincronização (só nesta aba/aparelho): a Geladeira daqui já foi da conta; há envio pendente. */
export function lerMarca(chave: string): boolean {
  void chave;
  return false;
}

export function gravarMarca(chave: string, ligada: boolean): void {
  void chave;
  void ligada;
}
