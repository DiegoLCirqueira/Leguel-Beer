import { z } from "zod";

export const PARCELAS_MAXIMAS = 12;

export const pixSchema = z.object({ tipo: z.literal("pix") });

/**
 * O cartão chega à API só com as parcelas: o pagamento é simulado (ADR-018), então não há token,
 * bandeira nem número. Campos extras são descartados.
 */
export const cartaoSchema = z.object({
  tipo: z.literal("cartao"),
  parcelas: z.int().min(1).max(PARCELAS_MAXIMAS),
});

export const formaDePagamentoSchema = z.discriminatedUnion("tipo", [pixSchema, cartaoSchema]);

export type FormaDePagamento = z.infer<typeof formaDePagamentoSchema>;
