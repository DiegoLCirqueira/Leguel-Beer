import { destaquesResponseSchema, type CervejaCard } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";
import { buscarComLimite } from "./fetch-com-limite";

export type ResultadoDosDestaques = { ok: true; itens: CervejaCard[] } | { ok: false };

/** GET /catalogo/destaques no servidor: nunca lança; falha, erro da API ou corpo inválido viram `{ ok: false }`. */
export async function buscarDestaques(): Promise<ResultadoDosDestaques> {
  try {
    return await buscarComLimite(
      `${urlDaApi()}/catalogo/destaques`,
      async (resposta): Promise<ResultadoDosDestaques> => {
        if (!resposta.ok) return { ok: false };
        const corpo = destaquesResponseSchema.safeParse(await resposta.json());
        return corpo.success ? { ok: true, itens: corpo.data.itens } : { ok: false };
      },
    );
  } catch {
    return { ok: false };
  }
}
