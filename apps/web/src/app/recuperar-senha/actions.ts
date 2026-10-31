"use server";

import { criarAuth, origemDoSite } from "@/lib/auth/servidor";
import { pedirRecuperacao, type ResultadoPedido } from "@/lib/auth/recuperar-senha";

/** Pede o e-mail de recuperação; o endereço do link vem de SITE_URL, nunca do cabeçalho Host. */
export async function pedirRecuperacaoAction(entrada: { email: string }): Promise<ResultadoPedido> {
  const auth = criarAuth();
  const origem = origemDoSite();
  if (!auth || !origem) return { tipo: "erro" };
  return pedirRecuperacao(entrada, { auth, redirectTo: `${origem}/nova-senha` });
}
