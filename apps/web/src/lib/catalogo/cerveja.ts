import { cervejaDetalheSchema, slugReservado, type CervejaDetalhe } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";
import { buscarComLimite } from "./fetch-com-limite";

export type ResultadoDaCerveja =
  { tipo: "ok"; cerveja: CervejaDetalhe } | { tipo: "nao-encontrada" } | { tipo: "erro" };

/** GET /catalogo/:slug no servidor: nunca lança; 404 é "não encontrada", o resto que falha é "erro". */
export async function buscarCerveja(slug: string): Promise<ResultadoDaCerveja> {
  if (slugReservado(slug)) return { tipo: "nao-encontrada" };
  try {
    return await buscarComLimite(
      `${urlDaApi()}/catalogo/${encodeURIComponent(slug)}`,
      async (resposta) => {
        if (resposta.status === 404) return { tipo: "nao-encontrada" } as const;
        if (!resposta.ok) return { tipo: "erro" } as const;
        const corpo = cervejaDetalheSchema.safeParse(await resposta.json());
        return corpo.success
          ? ({ tipo: "ok", cerveja: corpo.data } as const)
          : ({ tipo: "erro" } as const);
      },
    );
  } catch {
    return { tipo: "erro" };
  }
}
