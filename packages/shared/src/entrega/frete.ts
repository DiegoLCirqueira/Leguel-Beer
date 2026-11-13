export type ConfiguracaoDeEntrega = {
  readonly taxaBaseCentavos: number;
  readonly valorPorKmCentavos: number;
  readonly raioMaximoMetros: number;
  readonly freteGratisMinimoCentavos: number;
};

export type Frete =
  | { readonly naArea: false }
  | { readonly naArea: true; readonly freteCentavos: number; readonly gratis: boolean };

export function calcularFrete(
  _entrada: { readonly distanciaMetros: number; readonly subtotalCentavos: number },
  _config: ConfiguracaoDeEntrega,
): Frete {
  return { naArea: false };
}
