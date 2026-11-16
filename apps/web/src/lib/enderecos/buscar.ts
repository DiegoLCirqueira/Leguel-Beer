import { listaDeEnderecosSchema, type EnderecoResposta } from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";

export type ResultadoDosEnderecos =
  { tipo: "ok"; enderecos: EnderecoResposta[] } | { tipo: "sem-sessao" } | { tipo: "erro" };

/** Uma API que não responde não pode deixar a tela esperando. */
const TEMPO_LIMITE_MS = 8000;

/** GET /me/enderecos no servidor do site, com o token da sessão. Nunca lança. */
export async function buscarEnderecos(token: string): Promise<ResultadoDosEnderecos> {
  try {
    const resposta = await fetch(`${urlDaApi()}/me/enderecos`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resposta.status === 401) return { tipo: "sem-sessao" };
    if (!resposta.ok) return { tipo: "erro" };
    const lida = listaDeEnderecosSchema.safeParse(await resposta.json());
    return lida.success ? { tipo: "ok", enderecos: lida.data } : { tipo: "erro" };
  } catch {
    return { tipo: "erro" };
  }
}
