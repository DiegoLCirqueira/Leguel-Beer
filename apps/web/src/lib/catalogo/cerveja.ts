import { cervejaDetalheSchema, type CervejaDetalhe } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";

/** Uma API que não responde não pode deixar a tela esperando: passou disso, vale o erro. */
const TEMPO_LIMITE_MS = 8000;

export type ResultadoDaCerveja =
  { tipo: "ok"; cerveja: CervejaDetalhe } | { tipo: "nao-encontrada" } | { tipo: "erro" };

/** GET /catalogo/:slug no servidor: nunca lança; 404 é "não encontrada", o resto que falha é "erro". */
export async function buscarCerveja(slug: string): Promise<ResultadoDaCerveja> {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(`${urlDaApi()}/catalogo/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      signal: controle.signal,
    });
    if (resposta.status === 404) return { tipo: "nao-encontrada" };
    if (!resposta.ok) return { tipo: "erro" };
    const corpo = cervejaDetalheSchema.safeParse(await resposta.json());
    return corpo.success ? { tipo: "ok", cerveja: corpo.data } : { tipo: "erro" };
  } catch {
    return { tipo: "erro" };
  } finally {
    clearTimeout(limite);
  }
}
