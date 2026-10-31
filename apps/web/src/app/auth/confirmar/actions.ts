"use server";

import { redirect } from "next/navigation";
import { criarPerfilNoPrimeiroAcesso } from "@/lib/auth/primeiro-acesso";
import { criarAuth, criarClienteApi, gravarSessao } from "@/lib/auth/servidor";

const LINK_INVALIDO = "/entrar?aviso=link-invalido";

/**
 * Confirma o e-mail pelo POST do botão "Confirmar minha conta": troca o token do link por uma
 * sessão, entra na conta (com Manter-me conectado, como a boas-vindas) e cria o perfil com os
 * dados do cadastro. O GET da página não gasta o token, então scanners de e-mail não o consomem
 * e um link aberto por terceiros não faz login sozinho.
 */
export async function confirmarContaAction(formData: FormData): Promise<never> {
  const tokenHash = formData.get("token_hash");
  const auth = criarAuth();
  if (typeof tokenHash !== "string" || !tokenHash || formData.get("type") !== "signup" || !auth) {
    redirect(LINK_INVALIDO);
  }

  const sessao = await auth.verify({ tokenHash, type: "signup" });
  if (!sessao) redirect(LINK_INVALIDO);

  await gravarSessao(sessao, true);
  await criarPerfilNoPrimeiroAcesso(sessao, { api: criarClienteApi(sessao) });
  redirect("/");
}
