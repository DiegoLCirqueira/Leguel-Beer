import { catalogoResponseSchema, type CatalogoQuery, type CatalogoResponse } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";
import { buscarComLimite } from "./fetch-com-limite";
import { paraQueryString } from "./url";

export type ResultadoDoCatalogo = { ok: true; dados: CatalogoResponse } | { ok: false };

/** Espera antes da segunda (e última) tentativa. */
export const ESPERA_DO_RETRY_MS = 300;

/** Falhas que costumam passar sozinhas: limite de taxa (429) e API/proxy momentaneamente fora. */
const STATUS_TRANSITORIOS = new Set([429, 502, 503, 504]);

type Tentativa = { resultado: ResultadoDoCatalogo; transitoria: boolean };

async function tentar(url: string): Promise<Tentativa> {
  try {
    return await buscarComLimite(url, async (resposta): Promise<Tentativa> => {
      if (!resposta.ok) {
        return { resultado: { ok: false }, transitoria: STATUS_TRANSITORIOS.has(resposta.status) };
      }
      const corpo = catalogoResponseSchema.safeParse(await resposta.json());
      return {
        resultado: corpo.success ? { ok: true, dados: corpo.data } : { ok: false },
        transitoria: false,
      };
    });
  } catch (erro) {
    // Estouro do limite de 8 s não repete (já esperou demais); falha de rede, sim.
    const abortada = erro instanceof Error && erro.name === "AbortError";
    return { resultado: { ok: false }, transitoria: !abortada };
  }
}

/**
 * GET /catalogo no servidor: nunca lança; falha de rede, erro da API ou corpo fora do contrato viram
 * `{ ok: false }`. Uma falha transitória (429, 502-504, rede) é tentada de novo uma única vez; erro
 * real (4xx, 500, corpo inválido, limite de tempo) não é repetido nem escondido.
 */
export async function buscarCatalogo(query: CatalogoQuery): Promise<ResultadoDoCatalogo> {
  const queryString = paraQueryString(query);
  const url = `${urlDaApi()}/catalogo${queryString ? `?${queryString}` : ""}`;
  const primeira = await tentar(url);
  if (!primeira.transitoria) return primeira.resultado;
  await new Promise((resolver) => setTimeout(resolver, ESPERA_DO_RETRY_MS));
  return (await tentar(url)).resultado;
}
