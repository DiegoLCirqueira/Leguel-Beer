"use server";

import { revalidatePath } from "next/cache";
import { urlDaApi } from "@/lib/auth/config";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";

export type ResultadoDaAcao = { tipo: "ok" | "sem-sessao" | "nao-encontrado" | "erro" };

/** Uma API que não responde não pode deixar a tela esperando. */
const TEMPO_LIMITE_MS = 8000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Chama a API com o token da sessão (cookie HttpOnly, que o navegador nunca vê). Nunca lança. */
async function chamar(
  method: "POST" | "DELETE",
  id: string,
  sufixo = "",
): Promise<ResultadoDaAcao> {
  // O id vem do navegador: só um UUID entra no caminho da API.
  if (!UUID.test(id)) return { tipo: "erro" };
  const token = await lerTokenDeAcesso();
  if (!token) return { tipo: "sem-sessao" };
  try {
    const resposta = await fetch(`${urlDaApi()}/me/enderecos/${id}${sufixo}`, {
      method,
      cache: "no-store",
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resposta.status === 401) return { tipo: "sem-sessao" };
    if (resposta.status === 404) return { tipo: "nao-encontrado" };
    if (!resposta.ok) return { tipo: "erro" };
  } catch {
    return { tipo: "erro" };
  }
  revalidatePath("/conta/enderecos");
  return { tipo: "ok" };
}

/** "Tornar padrão": só o escolhido fica com o selo. */
export async function tornarPadraoAction(id: string): Promise<ResultadoDaAcao> {
  return chamar("POST", id, "/padrao");
}

/** Excluir: excluir o padrão torna padrão o mais recente (regra da API). */
export async function excluirEnderecoAction(id: string): Promise<ResultadoDaAcao> {
  return chamar("DELETE", id);
}

export type ResultadoDoSalvar =
  | { tipo: "ok" | "sem-sessao" }
  | { tipo: "invalido"; erros: Record<string, string> }
  | { tipo: "erro"; mensagem: string };

export async function salvarEnderecoAction(
  _entrada: unknown,
  _id?: string,
): Promise<ResultadoDoSalvar> {
  return { tipo: "sem-sessao" };
}
