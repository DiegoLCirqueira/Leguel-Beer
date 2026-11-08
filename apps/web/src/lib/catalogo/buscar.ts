import { catalogoResponseSchema, type CatalogoQuery, type CatalogoResponse } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";
import { paraQueryString } from "./url";

/** Uma API que não responde não pode deixar a tela esperando: passou disso, vale o estado de erro. */
const TEMPO_LIMITE_MS = 8000;

export type ResultadoDoCatalogo = { ok: true; dados: CatalogoResponse } | { ok: false };

/** GET /catalogo no servidor: nunca lança; falha de rede, erro da API ou corpo fora do contrato viram `{ ok: false }`. */
export async function buscarCatalogo(query: CatalogoQuery): Promise<ResultadoDoCatalogo> {
  const queryString = paraQueryString(query);
  const url = `${urlDaApi()}/catalogo${queryString ? `?${queryString}` : ""}`;
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(url, { cache: "no-store", signal: controle.signal });
    if (!resposta.ok) return { ok: false };
    const corpo = catalogoResponseSchema.safeParse(await resposta.json());
    return corpo.success ? { ok: true, dados: corpo.data } : { ok: false };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(limite);
  }
}
