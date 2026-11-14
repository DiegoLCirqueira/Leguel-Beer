import { z } from "zod";

export const PARCELAS_MAXIMAS = 12;

const pixSchema = z.object({ tipo: z.literal("pix") });

/** O cartão chega à API só como token do gateway: número e CVV nunca passam por aqui. */
const cartaoSchema = z.object({
  tipo: z.literal("cartao"),
  token: z.string().min(1),
  parcelas: z.int().min(1).max(PARCELAS_MAXIMAS),
  bandeira: z.string().min(1),
});

export const formaDePagamentoSchema = z.discriminatedUnion("tipo", [pixSchema, cartaoSchema]);

export type FormaDePagamento = z.infer<typeof formaDePagamentoSchema>;
