"use server";

import { redirect } from "next/navigation";
import { entrar, type EntradaLogin } from "@/lib/auth/entrar";
import { criarPerfilNoPrimeiroAcesso } from "@/lib/auth/primeiro-acesso";
import { criarAuth, criarClienteApi, gravarSessao, origemDoSite } from "@/lib/auth/servidor";
import { retornoInterno } from "@/lib/retorno";
import type { RespostaEntrar } from "@/components/auth/entrar-form";

/**
 * Entra, grava a sessão em cookies HttpOnly e vai para a página de onde a pessoa veio (só endereços
 * do site) ou para a home. Em caso de falha devolve o aviso; em caso de sucesso redireciona.
 */
export async function entrarAction(
  retorno: string | undefined,
  entrada: EntradaLogin,
): Promise<RespostaEntrar> {
  const auth = criarAuth();
  if (!auth) return { tipo: "erro" };

  const resultado = await entrar(entrada, { auth });
  if (resultado.tipo !== "ok") return resultado;

  await gravarSessao(resultado.sessao, resultado.manterConectado);
  // Primeiro acesso: o perfil é criado uma vez; repetir é seguro (idempotente) e uma falha da API
  // não impede a entrada, o pedido se repete no próximo acesso.
  await criarPerfilNoPrimeiroAcesso(resultado.sessao, {
    api: criarClienteApi(resultado.sessao),
  });
  redirect(retornoInterno(retorno, "/"));
}

export async function reenviarAction(email: string): Promise<"enviado" | "erro"> {
  const auth = criarAuth();
  const origem = origemDoSite();
  if (!auth || !origem) return "erro";
  return auth.resend(email, `${origem}/auth/confirmar`);
}
