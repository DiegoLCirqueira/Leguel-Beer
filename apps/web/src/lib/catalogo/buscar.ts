import { catalogoResponseSchema, type CatalogoQuery, type CatalogoResponse } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";
import { paraQueryString } from "./url";

export type ResultadoDoCatalogo = { ok: true; dados: CatalogoResponse } | { ok: false };

/** GET /catalogo no servidor: nunca lança; falha de rede, erro da API ou corpo fora do contrato viram `{ ok: false }`. */
export async function buscarCatalogo(query: CatalogoQuery): Promise<ResultadoDoCatalogo> {
  const queryString = paraQueryString(query);
  const url = `${urlDaApi()}/catalogo${queryString ? `?${queryString}` : ""}`;
  try {
    const resposta = await fetch(url, { cache: "no-store" });
    if (!resposta.ok) return { ok: false };
    const corpo = catalogoResponseSchema.safeParse(await resposta.json());
    return corpo.success ? { ok: true, dados: corpo.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}
