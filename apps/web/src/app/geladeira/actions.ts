"use server";

import {
  geladeiraRequestSchema,
  geladeiraResponseSchema,
  type GeladeiraRequest,
} from "@leguele/shared";
import { urlDaApi } from "@/lib/auth/config";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";
import type { ResultadoDaConta } from "@/lib/geladeira/conta";

/** Uma API que não responde não pode deixar a tela esperando. */
const TEMPO_LIMITE_MS = 8000;

/** Chama `/me/geladeira` com o token da sessão (que o navegador nunca vê: cookie HttpOnly). */
async function chamar(method: "GET" | "PUT", corpo?: GeladeiraRequest): Promise<ResultadoDaConta> {
  const token = await lerTokenDeAcesso();
  if (!token) return { tipo: "sem-sessao" };
  try {
    const resposta = await fetch(`${urlDaApi()}/me/geladeira`, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
      headers: {
        Authorization: `Bearer ${token}`,
        ...(corpo ? { "Content-Type": "application/json" } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    if (resposta.status === 401) return { tipo: "sem-sessao" };
    if (resposta.status === 409) return { tipo: "sem-perfil" };
    if (!resposta.ok) return { tipo: "erro" };
    const lida = geladeiraResponseSchema.safeParse(await resposta.json());
    return lida.success ? { tipo: "ok", resposta: lida.data } : { tipo: "erro" };
  } catch {
    return { tipo: "erro" };
  }
}

/** Lê a Geladeira da conta (já revalidada pela API). Nunca lança. */
export async function buscarGeladeiraDaContaAction(): Promise<ResultadoDaConta> {
  return chamar("GET");
}

/** Manda a Geladeira inteira para a conta (substitui a de lá). O pedido vem do navegador: é validado aqui. */
export async function enviarGeladeiraParaContaAction(
  request: GeladeiraRequest,
): Promise<ResultadoDaConta> {
  const valido = geladeiraRequestSchema.safeParse(request);
  return valido.success ? chamar("PUT", valido.data) : { tipo: "erro" };
}
