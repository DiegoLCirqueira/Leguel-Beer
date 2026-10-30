"use server";

import { headers } from "next/headers";
import { criarConta, type EntradaCadastro, type ResultadoCriarConta } from "@/lib/auth/criar-conta";
import { createGoTrue } from "@/lib/auth/gotrue";

export async function criarContaAction(entrada: EntradaCadastro): Promise<ResultadoCriarConta> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return { tipo: "erro" };

  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host");
  const protocolo = cabecalhos.get("x-forwarded-proto") ?? "http";
  if (!host) return { tipo: "erro" };

  return criarConta(entrada, {
    auth: createGoTrue({ url, anonKey }),
    redirectTo: `${protocolo}://${host}/auth/confirmar`,
  });
}
