import type { CatalogoQuery, CatalogoResponse } from "@leguele/shared";

export type ResultadoDoCatalogo = { ok: true; dados: CatalogoResponse } | { ok: false };

export async function buscarCatalogo(query: CatalogoQuery): Promise<ResultadoDoCatalogo> {
  void query;
  return { ok: false };
}
