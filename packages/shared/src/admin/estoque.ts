import { z } from "zod";

export const ajusteDeEstoqueSchema = z.object({});

export function variacaoDoAjuste(ajuste: unknown): number {
  void ajuste;
  return 0;
}
