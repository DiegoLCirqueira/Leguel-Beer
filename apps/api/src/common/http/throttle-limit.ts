/** Limite padrão de requisições por IP por minuto (o mesmo de antes de ser configurável). */
export const DEFAULT_THROTTLE_LIMIT = 100;

/** Só inteiros positivos em dígitos: "0", "-5", "1.5", "abc" e "Infinity" caem no padrão. */
export function parseThrottleLimit(raw: string | undefined, _production: boolean): number {
  if (!raw || !/^[1-9]\d{0,8}$/.test(raw)) return DEFAULT_THROTTLE_LIMIT;
  return Number(raw);
}
