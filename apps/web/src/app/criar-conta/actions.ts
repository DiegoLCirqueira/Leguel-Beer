"use server";

import { criarConta, type EntradaCadastro, type ResultadoCriarConta } from "@/lib/auth/criar-conta";
import { createGoTrue } from "@/lib/auth/gotrue";

const SITE_LOCAL = "http://localhost:3000";

/**
 * Origem do site vinda da configuração (SITE_URL), nunca do cabeçalho Host, que o cliente controla.
 * Fora de produção, sem SITE_URL, vale o endereço local.
 */
function origemDoSite(): string | undefined {
  const configurada = process.env.SITE_URL?.replace(/\/+$/, "");
  if (configurada) return configurada;
  return process.env.NODE_ENV === "production" ? undefined : SITE_LOCAL;
}

export async function criarContaAction(entrada: EntradaCadastro): Promise<ResultadoCriarConta> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  const origem = origemDoSite();
  if (!url || !anonKey || !origem) return { tipo: "erro" };

  return criarConta(entrada, {
    auth: createGoTrue({ url, anonKey }),
    redirectTo: `${origem}/auth/confirmar`,
  });
}
