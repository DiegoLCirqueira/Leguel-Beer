import { z } from "zod";
import { ESTOQUE_MAXIMO } from "./cerveja.js";

const motivoObrigatorio = z.string().trim().min(1).max(80);

/** Ajuste de estoque. Entrada soma, perda subtrai e correção soma ou subtrai (quantidade com sinal). */
export const ajusteDeEstoqueSchema = z.discriminatedUnion("tipo", [
  z.strictObject({
    tipo: z.literal("entrada"),
    quantidade: z.int().positive().max(ESTOQUE_MAXIMO),
    motivo: z.string().trim().min(1).max(80).default("Produção"),
  }),
  z.strictObject({
    tipo: z.literal("perda"),
    quantidade: z.int().positive().max(ESTOQUE_MAXIMO),
    motivo: motivoObrigatorio,
  }),
  z.strictObject({
    tipo: z.literal("correcao"),
    quantidade: z
      .int()
      .min(-ESTOQUE_MAXIMO)
      .max(ESTOQUE_MAXIMO)
      .refine((q) => q !== 0, { message: "A quantidade não pode ser zero." }),
    motivo: motivoObrigatorio,
  }),
]);

export type AjusteDeEstoque = z.infer<typeof ajusteDeEstoqueSchema>;

/** O quanto o estoque físico muda: positivo soma, negativo subtrai. */
export function variacaoDoAjuste(ajuste: AjusteDeEstoque): number {
  return ajuste.tipo === "perda" ? -ajuste.quantidade : ajuste.quantidade;
}
