/** Percentual de desconto do preço anterior para o atual, inteiro, ou nulo quando não há desconto. */
export function calcularDesconto(
  anteriorCentavos: number | null | undefined,
  atualCentavos: number,
): number | null {
  if (anteriorCentavos == null || anteriorCentavos <= atualCentavos) return null;
  const anterior = anteriorCentavos;
  return Math.round(((anterior - atualCentavos) / anterior) * 100);
}
