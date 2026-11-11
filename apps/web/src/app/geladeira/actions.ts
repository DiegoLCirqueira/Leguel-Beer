"use server";

import type { GeladeiraRequest } from "@leguele/shared";
import type { ResultadoDaConta } from "@/lib/geladeira/conta";

export async function buscarGeladeiraDaContaAction(): Promise<ResultadoDaConta> {
  return { tipo: "erro" };
}

export async function enviarGeladeiraParaContaAction(
  request: GeladeiraRequest,
): Promise<ResultadoDaConta> {
  void request;
  return { tipo: "erro" };
}
