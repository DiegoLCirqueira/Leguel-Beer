import type { StatusDoPedido } from "./status.js";

export const ROTULO_DO_STATUS: Record<StatusDoPedido, string> = {
  "aguardando-pagamento": "Aguardando pagamento",
  pago: "Pago",
  "em-preparo": "Em preparo",
  "saiu-para-entrega": "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};
