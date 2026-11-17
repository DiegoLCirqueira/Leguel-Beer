"use server";

import { enderecoFormSchema } from "@leguele/shared";
import { revalidatePath } from "next/cache";
import { urlDaApi } from "@/lib/auth/config";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";

export type ResultadoDaAcao = { tipo: "ok" | "sem-sessao" | "nao-encontrado" | "erro" };

/** Uma API que não responde não pode deixar a tela esperando. */
const TEMPO_LIMITE_MS = 8000;
/** A API espera até 8 s pelos mapas ao salvar; o site espera um pouco mais que ela. */
const TEMPO_LIMITE_MAPAS_MS = 10000;
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

const FALHA_AO_SALVAR = "Não foi possível salvar agora. Tente de novo.";

/** Corpo de erro da API ({ code, message }); as mensagens de endereço e de mapas são para o cliente. */
async function mensagemDaApi(resposta: Response): Promise<string | undefined> {
  try {
    const corpo = (await resposta.json()) as { code?: unknown; message?: unknown };
    const dele = [
      "ADDRESS_NOT_LOCATED",
      "MAPS_UNAVAILABLE",
      "DELIVERY_SETTINGS_MISSING",
      "ADDRESS_LIMIT_REACHED",
    ];
    return typeof corpo.code === "string" &&
      dele.includes(corpo.code) &&
      typeof corpo.message === "string"
      ? corpo.message
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Salva (sem id) ou edita (com id) um endereço. O formulário vem do navegador: é validado aqui com o
 * mesmo schema da API, e as coordenadas nunca passam por aqui (a API as calcula).
 */
export async function salvarEnderecoAction(
  entrada: unknown,
  id?: string,
): Promise<ResultadoDoSalvar> {
  const valido = enderecoFormSchema.safeParse(entrada);
  if (!valido.success) {
    const erros: Record<string, string> = {};
    for (const problema of valido.error.issues) {
      const campo = String(problema.path[0] ?? "");
      if (campo && !(campo in erros)) erros[campo] = problema.message;
    }
    return { tipo: "invalido", erros };
  }
  if (id !== undefined && !UUID.test(id)) return { tipo: "erro", mensagem: FALHA_AO_SALVAR };
  const token = await lerTokenDeAcesso();
  if (!token) return { tipo: "sem-sessao" };
  try {
    const resposta = await fetch(`${urlDaApi()}/me/enderecos${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(TEMPO_LIMITE_MAPAS_MS),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(valido.data),
    });
    if (resposta.status === 401) return { tipo: "sem-sessao" };
    if (resposta.status === 429) {
      return { tipo: "erro", mensagem: "Muitas tentativas. Tente de novo em instantes." };
    }
    if (!resposta.ok) {
      return { tipo: "erro", mensagem: (await mensagemDaApi(resposta)) ?? FALHA_AO_SALVAR };
    }
  } catch {
    return { tipo: "erro", mensagem: FALHA_AO_SALVAR };
  }
  revalidatePath("/conta/enderecos");
  return { tipo: "ok" };
}
