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

/** Os dois primeiros nomes e, se houver mais, "e mais N". */
export function textoDasCervejas(nomes: readonly string[]): string {
  const primeiras = nomes.slice(0, 2).join(", ");
  return nomes.length > 2 ? `${primeiras} e mais ${nomes.length - 2}` : primeiras;
}
