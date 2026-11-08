/** Percentual de desconto do preço anterior para o atual, inteiro, ou nulo quando não há desconto. */
export function calcularDesconto(
  anteriorCentavos: number | null | undefined,
  atualCentavos: number,
): number | null {
  const anterior = anteriorCentavos as number;
  if (anterior <= atualCentavos) return null;
  return Math.round(((anterior - atualCentavos) / anterior) * 100);
}
