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
  proximoCursor: z.string().min(1).max(200).nullable(),
});

export type ListaDePedidos = z.infer<typeof listaDePedidosSchema>;

/** Pedidos por página na lista "Meus pedidos" (também o máximo que a consulta aceita). */
export const PEDIDOS_POR_PAGINA = 20;

const CURSOR_MAXIMO = 200;

/** Consulta da lista: `cursor` da página anterior (opcional) e `limite` (padrão e máximo de 20). */
export const consultaDaListaDePedidosSchema = z.object({
  cursor: z.string().min(1).max(CURSOR_MAXIMO).optional(),
  limite: z.coerce.number().int().min(1).max(PEDIDOS_POR_PAGINA).default(PEDIDOS_POR_PAGINA),
});

export type ConsultaDaListaDePedidos = z.infer<typeof consultaDaListaDePedidosSchema>;
