/** Limite padrão de requisições por IP por minuto (o mesmo de antes de ser configurável). */
export const DEFAULT_THROTTLE_LIMIT = 100;

/** Teto em produção: valor alto é só para o ambiente local e de E2E. */
export const PRODUCTION_THROTTLE_CEILING = 1000;

/** Só inteiros positivos em dígitos: "0", "-5", "1.5", "abc" e "Infinity" caem no padrão. */
export function parseThrottleLimit(raw: string | undefined, production: boolean): number {
  if (!raw || !/^[1-9]\d{0,8}$/.test(raw)) return DEFAULT_THROTTLE_LIMIT;
  const value = Number(raw);
  return production ? Math.min(value, PRODUCTION_THROTTLE_CEILING) : value;
}

/** Lê o limite do ambiente do processo; produção é `NODE_ENV=production` ou qualquer `VERCEL_ENV`. */
export function throttleLimitFromEnv(env: Record<string, string | undefined>): number {
  // Qualquer VERCEL_ENV (preview inclusive) é endereço público: vale o teto.
  const production = env["NODE_ENV"] === "production" || !!env["VERCEL_ENV"];
  return parseThrottleLimit(env["THROTTLE_LIMIT"], production);
}
