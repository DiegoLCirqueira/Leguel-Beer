import { catalogoResponseSchema, type CatalogoQuery, type CatalogoResponse } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";
import { buscarComLimite, TEMPO_LIMITE_MS } from "./fetch-com-limite";
import { paraQueryString } from "./url";

export type ResultadoDoCatalogo = { ok: true; dados: CatalogoResponse } | { ok: false };

/** Espera antes da segunda (e última) tentativa. */
export const ESPERA_DO_RETRY_MS = 300;

/** API/proxy momentaneamente fora. O 429 só conta se o Retry-After for curto (ver `transitorio`). */
const STATUS_TRANSITORIOS = new Set([502, 503, 504]);

/** Um 429 só vale o retry se a espera pedida for de até 2 s; mais que isso, repetir só gasta o limite. */
const RETRY_AFTER_MAXIMO_S = 2;

function transitorio(resposta: Response): boolean {
  if (STATUS_TRANSITORIOS.has(resposta.status)) return true;
  if (resposta.status !== 429) return false;
  const bruto = resposta.headers.get("Retry-After")?.trim();
  // Ausente, vazio ou inválido (não é um número de segundos >= 0) conta como ausente: sem retry.
  if (!bruto || !/^\d+(\.\d+)?$/.test(bruto)) return false;
  return Number(bruto) <= RETRY_AFTER_MAXIMO_S;
}

type Tentativa = { resultado: ResultadoDoCatalogo; transitoria: boolean };

async function tentar(url: string, limiteMs: number): Promise<Tentativa> {
  try {
    return await buscarComLimite(
      url,
      async (resposta): Promise<Tentativa> => {
        if (!resposta.ok) {
          return { resultado: { ok: false }, transitoria: transitorio(resposta) };
        }
        const corpo = catalogoResponseSchema.safeParse(await resposta.json());
        return {
          resultado: corpo.success ? { ok: true, dados: corpo.data } : { ok: false },
          transitoria: false,
        };
      },
      limiteMs,
    );
  } catch (erro) {
    // Estouro do limite de 8 s não repete (já esperou demais); falha de rede, sim.
    const abortada = erro instanceof Error && erro.name === "AbortError";
    return { resultado: { ok: false }, transitoria: !abortada };
  }
}

/**
 * GET /catalogo no servidor: nunca lança; falha de rede, erro da API ou corpo fora do contrato viram
 * `{ ok: false }`. Uma falha transitória (502-504, rede, 429 com Retry-After de até 2 s) é tentada de
 * novo uma única vez, dentro de um orçamento total de 8 s; erro real (4xx, 500, corpo inválido, limite
 * de tempo) não é repetido nem escondido.
 */
export async function buscarCatalogo(query: CatalogoQuery): Promise<ResultadoDoCatalogo> {
  const queryString = paraQueryString(query);
  const url = `${urlDaApi()}/catalogo${queryString ? `?${queryString}` : ""}`;
  const inicio = Date.now();
  const primeira = await tentar(url, TEMPO_LIMITE_MS);
  if (!primeira.transitoria) return primeira.resultado;
  await new Promise((resolver) => setTimeout(resolver, ESPERA_DO_RETRY_MS));
  // Orçamento total de 8 s para as duas tentativas (o SSR não passa do limite da função).
  const restante = TEMPO_LIMITE_MS - (Date.now() - inicio);
  if (restante <= 0) return primeira.resultado;
  return (await tentar(url, restante)).resultado;
}
