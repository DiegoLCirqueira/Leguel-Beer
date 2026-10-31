"use server";

import { redirect } from "next/navigation";
import { definirNovaSenha, type ResultadoNovaSenha } from "@/lib/auth/recuperar-senha";
import { criarAuth, gravarSessao } from "@/lib/auth/servidor";

type Resposta = Exclude<ResultadoNovaSenha, { tipo: "ok" }>;

/**
 * Salva a nova senha. É aqui, no POST, que o link é gasto (abrir a página não gasta). Dando certo,
 * a pessoa já entra na conta (Manter-me conectado, como a confirmação do cadastro) e vai à home.
 */
export async function novaSenhaAction(
  tokenHash: string,
  type: string,
  dados: { senha: string; confirmacao: string },
): Promise<Resposta> {
  const auth = criarAuth();
  if (!auth) return { tipo: "erro" };

  const resultado = await definirNovaSenha({ tokenHash, type, ...dados }, { auth });
  if (resultado.tipo !== "ok") return resultado;

  await gravarSessao(resultado.sessao, true);
  redirect("/?aviso=senha-alterada");
}
