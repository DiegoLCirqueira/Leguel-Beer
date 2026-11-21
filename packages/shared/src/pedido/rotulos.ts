import type { StatusDoPedido } from "./status.js";

export const ROTULO_DO_STATUS: Record<StatusDoPedido, string> = {
  "aguardando-pagamento": "",
  pago: "",
  "em-preparo": "",
  "saiu-para-entrega": "",
  entregue: "",
  cancelado: "",
};
