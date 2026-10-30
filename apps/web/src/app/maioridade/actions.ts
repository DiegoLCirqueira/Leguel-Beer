"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MAIORIDADE_COOKIE, MAIORIDADE_VALIDADE_MS, retornoSeguro } from "@/lib/maioridade";

export async function confirmarMaioridade(formData: FormData) {
  const retorno = formData.get("retorno");
  const jar = await cookies();
  jar.set(MAIORIDADE_COOKIE, String(Date.now()), {
    path: "/",
    maxAge: MAIORIDADE_VALIDADE_MS / 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect(retornoSeguro(typeof retorno === "string" ? retorno : undefined));
}
