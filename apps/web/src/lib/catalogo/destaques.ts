import type { CervejaCard } from "@leguele/shared";

export type ResultadoDosDestaques = { ok: true; itens: CervejaCard[] } | { ok: false };

export async function buscarDestaques(): Promise<ResultadoDosDestaques> {
  return { ok: false };
}
