import { z } from "zod";

export const STATUS_DO_PEDIDO = [
  "aguardando-pagamento",
  "pago",
  "em-preparo",
  "saiu-para-entrega",
  "entregue",
  "cancelado",
] as const;

export const statusDoPedidoSchema = z.enum(STATUS_DO_PEDIDO);

export type StatusDoPedido = z.infer<typeof statusDoPedidoSchema>;
