export type ConfiguracaoDeEntrega = {
  readonly taxaBaseCentavos: number;
  readonly valorPorKmCentavos: number;
  readonly raioMaximoMetros: number;
  readonly freteGratisMinimoCentavos: number;
};

export type Frete =
  | { readonly naArea: false }
  | { readonly naArea: true; readonly freteCentavos: number; readonly gratis: boolean };

const PASSO_DO_ARREDONDAMENTO_CENTAVOS = 50;

export function calcularFrete(
  entrada: { readonly distanciaMetros: number; readonly subtotalCentavos: number },
  config: ConfiguracaoDeEntrega,
): Frete {
  if (entrada.distanciaMetros > config.raioMaximoMetros) {
    return { naArea: false };
  }

  if (entrada.subtotalCentavos >= config.freteGratisMinimoCentavos) {
    return { naArea: true, freteCentavos: 0, gratis: true };
  }

  // Em milésimos de centavo, para não depender de ponto flutuante.
  const exato = config.taxaBaseCentavos * 1000 + config.valorPorKmCentavos * entrada.distanciaMetros;
  const passo = PASSO_DO_ARREDONDAMENTO_CENTAVOS * 1000;
  const freteCentavos = Math.ceil(exato / passo) * PASSO_DO_ARREDONDAMENTO_CENTAVOS;

  return { naArea: true, freteCentavos, gratis: false };
}
