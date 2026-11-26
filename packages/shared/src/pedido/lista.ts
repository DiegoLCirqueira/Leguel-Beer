import { z } from "zod";
import { numeroDoPedidoSchema } from "./numero.js";
import { statusDoPedidoSchema } from "./status.js";

/** Um pedido na lista "Meus pedidos": só o que o card mostra. */
export const pedidoDaListaSchema = z.object({
  id: z.string().min(1),
  numero: numeroDoPedidoSchema,
  status: statusDoPedidoSchema,
  criadoEm: z.iso.datetime(),
  quantidadeDeItens: z.int().positive(),
  /** Nomes das cervejas na ordem do pedido; o site mostra os dois primeiros e "e mais N". */
  cervejas: z.array(z.string().min(1)).min(1),
  totalCentavos: z.int().nonnegative(),
});

export type PedidoDaLista = z.infer<typeof pedidoDaListaSchema>;

/** Página da lista, do mais recente ao mais antigo; `proximoCursor` é nulo na última página. */
export const listaDePedidosSchema = z.object({
  pedidos: z.array(pedidoDaListaSchema),
  proximoCursor: z.string().min(1).nullable(),
});

export type ListaDePedidos = z.infer<typeof listaDePedidosSchema>;
