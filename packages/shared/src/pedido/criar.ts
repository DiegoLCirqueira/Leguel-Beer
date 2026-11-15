import { z } from "zod";
import { formaDePagamentoSchema } from "../pagamento/forma.js";

/** Só o que o cliente decide. Itens, preços e frete vêm da Geladeira da conta, na API; campos extras são descartados. */
export const criarPedidoRequestSchema = z.object({
  enderecoId: z.string().min(1).max(64),
  pagamento: formaDePagamentoSchema,
  /** Total que o cliente viu, sem os juros do cartão. */
  totalVistoCentavos: z.int().positive(),
});

export type CriarPedidoRequest = z.infer<typeof criarPedidoRequestSchema>;

/** Valor do cabeçalho `Idempotency-Key`. */
export const chaveDeIdempotenciaSchema = z.string().regex(/^[A-Za-z0-9_-]{16,128}$/);
