"use server";

import { cotacaoDeFreteSchema } from "@leguele/shared";
import type { FreteEstimado } from "@/components/ui";
import { urlDaApi } from "@/lib/auth/config";
import { lerTokenDeAcesso } from "@/lib/auth/servidor";
import { buscarEnderecos } from "@/lib/enderecos/buscar";

export type ResultadoDoFrete =
  { tipo: "frete"; frete: FreteEstimado } | { tipo: "sem-endereco" } | { tipo: "sem-sessao" };

/** Uma API que não responde não pode deixar a tela esperando. */
const TEMPO_LIMITE_MS = 8000;
const INDISPONIVEL: ResultadoDoFrete = { tipo: "frete", frete: { tipo: "indisponivel" } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** GET /me/enderecos/:id/frete com o token; o id só entra no caminho se for UUID. Nunca lança. */
async function cotar(token: string, id: string): Promise<ResultadoDoFrete> {
  if (!UUID.test(id)) return INDISPONIVEL;
  try {
    const resposta = await fetch(`${urlDaApi()}/me/enderecos/${id}/frete`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resposta.status === 401) return { tipo: "sem-sessao" };
    if (!resposta.ok) return INDISPONIVEL;
    const cotacao = cotacaoDeFreteSchema.safeParse(await resposta.json());
    if (!cotacao.success) return INDISPONIVEL;
    if (!cotacao.data.naArea) return { tipo: "frete", frete: { tipo: "fora-da-area" } };
    if (cotacao.data.gratis) return { tipo: "frete", frete: { tipo: "gratis" } };
    return { tipo: "frete", frete: { tipo: "valor", centavos: cotacao.data.freteCentavos } };
  } catch {
    return INDISPONIVEL;
  }
}

/**
 * Frete estimado da Geladeira da conta pelo endereço padrão. Quem calcula é a API (subtotal da
 * Geladeira dela e regra de frete); o site só mostra. Nunca lança.
 */
export async function cotarFreteDoPadraoAction(): Promise<ResultadoDoFrete> {
  const token = await lerTokenDeAcesso();
  if (!token) return { tipo: "sem-sessao" };
  const lista = await buscarEnderecos(token);
  if (lista.tipo === "sem-sessao") return { tipo: "sem-sessao" };
  if (lista.tipo === "erro") return INDISPONIVEL;
  const padrao = lista.enderecos.find((e) => e.padrao);
  if (!padrao) return { tipo: "sem-endereco" };
  return cotar(token, padrao.id);
}

/** Frete da Geladeira da conta pelo endereço escolhido na Entrega do checkout. Nunca lança. */
export async function cotarFreteDoEnderecoAction(id: string): Promise<ResultadoDoFrete> {
  const token = await lerTokenDeAcesso();
  if (!token) return { tipo: "sem-sessao" };
  return cotar(token, id);
}
