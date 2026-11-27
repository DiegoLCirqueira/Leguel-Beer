import { z } from "zod";
import { cepSchema } from "../endereco/cep.js";
import { pedidoCriadoSchema } from "./resposta.js";
import { statusDoPedidoSchema } from "./status.js";

/** Cópia do endereço guardada no pedido: nunca muda se o cliente editar ou apagar o endereço. */
const enderecoDeEntregaSchema = z.object({
  apelido: z.string().min(1).optional(),
  cep: cepSchema,
  rua: z.string().min(1),
  numero: z.string().min(1),
  complemento: z.string().min(1).optional(),
  bairro: z.string().min(1),
  cidade: z.string().min(1),
  uf: z.string().length(2),
});

/** Quando o pedido entrou em cada status, do mais antigo ao mais recente. */
const mudancaDeStatusSchema = z.object({
  status: statusDoPedidoSchema,
  em: z.iso.datetime(),
});

/**
 * Um pedido do cliente lido por id (acompanhar, pagamento e confirmado): o pedido criado mais o
 * endereço de entrega e o histórico de status. Nunca leva o motivo do cancelamento (interno).
 */
export const pedidoDoClienteSchema = pedidoCriadoSchema.and(
  z.object({
    enderecoDeEntrega: enderecoDeEntregaSchema,
    historico: z.array(mudancaDeStatusSchema),
  }),
);

export type PedidoDoCliente = z.infer<typeof pedidoDoClienteSchema>;
