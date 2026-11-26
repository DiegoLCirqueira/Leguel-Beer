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

const FUSO_DA_LOJA = "America/Maceio";

const formatadorDaData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_DA_LOJA,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "12/11/2026 • 21:42", no fuso de Maceió. */
export function dataDoPedido(iso: string): string {
  const partes = Object.fromEntries(
    formatadorDaData.formatToParts(new Date(iso)).map(({ type, value }) => [type, value]),
  );
  return `${partes["day"]}/${partes["month"]}/${partes["year"]} • ${partes["hour"]}:${partes["minute"]}`;
}
