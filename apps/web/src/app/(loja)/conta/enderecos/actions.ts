"use server";

export type ResultadoDaAcao = { tipo: "ok" | "sem-sessao" | "nao-encontrado" | "erro" };

export async function tornarPadraoAction(_id: string): Promise<ResultadoDaAcao> {
  return { tipo: "erro" };
}

export async function excluirEnderecoAction(_id: string): Promise<ResultadoDaAcao> {
  return { tipo: "erro" };
}
