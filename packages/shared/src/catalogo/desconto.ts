/** Percentual de desconto do preço anterior para o atual, inteiro, ou nulo quando não há desconto. */
export function calcularDesconto(
  anteriorCentavos: number | null | undefined,
  atualCentavos: number,
): number | null {
  return Math.floor(
    (((anteriorCentavos as number) - atualCentavos) / (anteriorCentavos as number)) * 100,
  );
}
