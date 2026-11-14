export const VALIDADE_DO_PEDIDO_MINUTOS = 30;

const MS_POR_MINUTO = 60_000;

export function validoAte(criadoEm: Date): Date {
  return new Date(criadoEm.getTime() + VALIDADE_DO_PEDIDO_MINUTOS * MS_POR_MINUTO);
}

/** Vencido a partir do instante exato de `validoAte` (criado às 10:00:00, às 10:30:00 já venceu). */
export function pedidoVencido(validoAteEm: Date, agora: Date): boolean {
  return agora.getTime() >= validoAteEm.getTime();
}
