/** Limite padrão de requisições por IP por minuto (o mesmo de antes de ser configurável). */
export const DEFAULT_THROTTLE_LIMIT = 100;

export function parseThrottleLimit(_raw: string | undefined, _production: boolean): number {
  return 0;
}
