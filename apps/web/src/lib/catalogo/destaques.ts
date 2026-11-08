import { destaquesResponseSchema, type CervejaCard } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";

/** Uma API que não responde não pode deixar a home esperando: passou disso, vale o erro. */
const TEMPO_LIMITE_MS = 8000;

export type ResultadoDosDestaques = { ok: true; itens: CervejaCard[] } | { ok: false };

/** GET /catalogo/destaques no servidor: nunca lança; falha, erro da API ou corpo inválido viram `{ ok: false }`. */
export async function buscarDestaques(): Promise<ResultadoDosDestaques> {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(`${urlDaApi()}/catalogo/destaques`, {
      cache: "no-store",
      signal: controle.signal,
    });
    if (!resposta.ok) return { ok: false };
    const corpo = destaquesResponseSchema.safeParse(await resposta.json());
    return corpo.success ? { ok: true, itens: corpo.data.itens } : { ok: false };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(limite);
  }
}
