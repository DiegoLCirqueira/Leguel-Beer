import { z } from "zod";

export const confirmacaoDoPagamentoSchema = z.object({ emailEnviado: z.boolean() });

export type ConfirmacaoDoPagamento = z.infer<typeof confirmacaoDoPagamentoSchema>;
