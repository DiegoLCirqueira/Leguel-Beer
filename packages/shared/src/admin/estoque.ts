import { z } from "zod";

const motivoObrigatorio = z.string().trim().min(1).max(80);

/** Ajuste de estoque. Entrada soma, perda subtrai e correção soma ou subtrai (quantidade com sinal). */
export const ajusteDeEstoqueSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("entrada"),
    quantidade: z.int().positive(),
    motivo: z.string().trim().min(1).max(80).default("Produção"),
  }),
  z.object({
    tipo: z.literal("perda"),
    quantidade: z.int().positive(),
    motivo: motivoObrigatorio,
  }),
  z.object({
    tipo: z.literal("correcao"),
    quantidade: z.int().refine((q) => q !== 0, { message: "A quantidade não pode ser zero." }),
    motivo: motivoObrigatorio,
  }),
]);

export type AjusteDeEstoque = z.infer<typeof ajusteDeEstoqueSchema>;

/** O quanto o estoque físico muda: positivo soma, negativo subtrai. */
export function variacaoDoAjuste(ajuste: AjusteDeEstoque): number {
  return ajuste.tipo === "perda" ? -ajuste.quantidade : ajuste.quantidade;
}
