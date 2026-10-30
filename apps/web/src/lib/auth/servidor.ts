import { cookies } from "next/headers";
import { createApiClient } from "@/lib/api-client";
import { COOKIE_ACESSO, COOKIE_MANTER, COOKIE_RENOVACAO, opcoesCookieSessao } from "./cookies";
import { createGoTrue } from "./gotrue";
import type { Sessao } from "./gotrue";

const SITE_LOCAL = "http://localhost:3000";
const API_LOCAL = "http://localhost:3333";

const emProducao = () => process.env.NODE_ENV === "production";

/** Supabase Auth do ambiente, ou `undefined` se a configuração do servidor está incompleta. */
export function criarAuth() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  return url && anonKey ? createGoTrue({ url, anonKey }) : undefined;
}

/**
 * Origem do site vinda da configuração (SITE_URL), nunca do cabeçalho Host, que o cliente controla.
 * Fora de produção, sem SITE_URL, vale o endereço local.
 */
export function origemDoSite(): string | undefined {
  const configurada = process.env.SITE_URL?.replace(/\/+$/, "");
  if (configurada) return configurada;
  return emProducao() ? undefined : SITE_LOCAL;
}

/** Cliente da API com o token desta sessão (o servidor do site repassa em Authorization: Bearer). */
export function criarClienteApi(sessao: Sessao) {
  const baseUrl = process.env.API_URL || (emProducao() ? undefined : API_LOCAL);
  // Em produção a falta de API_URL é erro de configuração: falha alto, sem criar o perfil em silêncio.
  if (!baseUrl)
    throw new Error("API_URL é obrigatória em produção (endereço da API do Leguelé Beer).");
  return createApiClient({
    baseUrl,
    getToken: async () => sessao.accessToken,
    refreshSession: async () => null,
  });
}

/** Grava os cookies de sessão: HttpOnly, 30 dias com Manter-me conectado e sem validade sem ele. */
export async function gravarSessao(sessao: Sessao, manterConectado: boolean) {
  const jar = await cookies();
  const opcoes = opcoesCookieSessao({ manterConectado, producao: emProducao() });
  jar.set(COOKIE_ACESSO, sessao.accessToken, opcoes);
  jar.set(COOKIE_RENOVACAO, sessao.refreshToken, opcoes);
  jar.set(COOKIE_MANTER, manterConectado ? "1" : "0", opcoes);
}

/** Lê o token de acesso da sessão deste aparelho, se houver. */
export async function lerTokenDeAcesso(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE_ACESSO)?.value;
}

/** Apaga os cookies de sessão deste aparelho. */
export async function limparSessao() {
  const jar = await cookies();
  for (const nome of [COOKIE_ACESSO, COOKIE_RENOVACAO, COOKIE_MANTER]) jar.delete(nome);
}
