/**
 * Produção é `NODE_ENV=production` ou qualquer `VERCEL_ENV` (preview inclusive: o endereço é
 * público). Uma só regra para o limite de requisições, o aviso do cron e o que vier depois.
 */
export function isProductionEnv(env: Record<string, string | undefined>): boolean {
  return env["NODE_ENV"] === "production" || !!env["VERCEL_ENV"];
}
