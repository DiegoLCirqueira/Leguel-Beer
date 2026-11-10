import type { CervejaDetalhe } from "@leguele/shared";

export type ResultadoDaCerveja =
  { tipo: "ok"; cerveja: CervejaDetalhe } | { tipo: "nao-encontrada" } | { tipo: "erro" };

export async function buscarCerveja(slug: string): Promise<ResultadoDaCerveja> {
  void slug;
  return { tipo: "erro" };
}
