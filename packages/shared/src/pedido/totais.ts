import { calcularFrete } from "../entrega/frete.js";
import type { ConfiguracaoDeEntrega } from "../entrega/frete.js";

export type TotaisDoPedido =
  | { readonly naArea: false }
  | {
      readonly naArea: true;
      readonly subtotalCentavos: number;
      readonly freteCentavos: number;
      readonly totalCentavos: number;
    };

/** Subtotal, frete e total do pedido, com a mesma regra de frete do site e da API (sem juros do cartão). */
export function calcularTotais(
  entrada: { readonly distanciaMetros: number; readonly subtotalCentavos: number },
  config: ConfiguracaoDeEntrega,
): TotaisDoPedido {
  const frete = calcularFrete(entrada, config);
  if (!frete.naArea) {
    return { naArea: false };
  }
  return {
    naArea: true,
    subtotalCentavos: entrada.subtotalCentavos,
    freteCentavos: frete.freteCentavos,
    totalCentavos: entrada.subtotalCentavos + frete.freteCentavos,
  };
}
