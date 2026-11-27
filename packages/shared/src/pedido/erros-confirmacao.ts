import { z } from "zod";

/**
 * Os dois 409 de "Confirmar pagamento" do admin: o pedido venceu (e foi cancelado) ou já não
 * aguarda pagamento (pago, cancelado, segundo toque ou corrida). Os códigos de criar pedido ficam
 * em `CODIGOS_DE_ERRO_DO_PEDIDO`.
 */
export const CODIGOS_DE_ERRO_DA_CONFIRMACAO = ["ORDER_EXPIRED", "PAYMENT_NOT_CONFIRMABLE"] as const;

export const erroDaConfirmacaoSchema = z.object({
  code: z.enum(CODIGOS_DE_ERRO_DA_CONFIRMACAO),
  message: z.string(),
});

export type ErroDaConfirmacao = z.infer<typeof erroDaConfirmacaoSchema>;
