import type { StatusDoPedido } from "./status.js";

export const ROTULO_DO_STATUS: Record<StatusDoPedido, string> = {
  "aguardando-pagamento": "Aguardando pagamento",
  pago: "Pago",
  "em-preparo": "Em preparo",
  "saiu-para-entrega": "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function textoDeItens(quantidade: number): string {
  return quantidade === 1 ? "1 item" : `${quantidade} itens`;
}

export function textoDasCervejas(_nomes: readonly string[]): string {
  return "";
}
