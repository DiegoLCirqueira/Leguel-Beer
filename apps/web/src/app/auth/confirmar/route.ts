import { redirect } from "next/navigation";
import { criarPerfilNoPrimeiroAcesso } from "@/lib/auth/primeiro-acesso";
import { criarAuth, criarClienteApi, gravarSessao } from "@/lib/auth/servidor";

/**
 * Destino do link do e-mail de confirmação: troca o token do link por uma sessão, entra na conta
 * (com Manter-me conectado, como a boas-vindas) e cria o perfil com os dados do cadastro.
 */
export async function GET(request: Request) {
  const parametros = new URL(request.url).searchParams;
  const tokenHash = parametros.get("token_hash");
  const auth = criarAuth();

  if (!tokenHash || parametros.get("type") !== "signup" || !auth) redirect("/entrar");

  const sessao = await auth.verify({ tokenHash, type: "signup" });
  if (!sessao) redirect("/entrar");

  await gravarSessao(sessao, true);
  await criarPerfilNoPrimeiroAcesso(sessao, { api: criarClienteApi(sessao) });
  redirect("/");
}
