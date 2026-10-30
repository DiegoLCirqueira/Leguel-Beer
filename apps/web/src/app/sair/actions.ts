"use server";

import { redirect } from "next/navigation";
import { criarAuth, lerTokenDeAcesso, limparSessao } from "@/lib/auth/servidor";

/**
 * Sai da conta: encerra a sessão deste aparelho no Supabase (a renovação deixa de funcionar),
 * apaga os cookies e leva à boas-vindas. Mesmo que o Supabase não responda, os cookies somem.
 */
export async function sairAction(): Promise<never> {
  const token = await lerTokenDeAcesso();
  const auth = criarAuth();
  if (token && auth) await auth.signOut(token);
  await limparSessao();
  redirect("/boas-vindas");
}
