import { isProductionEnv } from "./production-env.js";

export const DEFAULT_WEB_ORIGIN = "http://localhost:3000";

/**
 * Origem do site liberada no CORS. Fora de produção vale `WEB_ORIGIN` ou o padrão local. Em
 * produção é obrigatória e precisa ser UMA origem `https` exata (sem curinga, caminho, barra final
 * nem vírgula): se falhar, a função não sobe, em vez de bloquear o site em silêncio.
 */
export function resolveWebOrigin(env: Record<string, string | undefined>): string {
  const raw = env["WEB_ORIGIN"];
  if (!isProductionEnv(env)) return raw || DEFAULT_WEB_ORIGIN;

  const invalid = (reason: string): Error =>
    new Error(
      `WEB_ORIGIN inválido em produção: ${reason}. Use uma única origem https, ex.: https://leguele-web.vercel.app.`,
    );
  if (!raw) throw invalid("ausente");
  if (raw.includes("*")) throw invalid("curinga não vale");
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw invalid("não é uma URL");
  }
  if (url.protocol !== "https:") throw invalid("precisa ser https");
  if (url.hostname === "localhost") throw invalid("localhost não vale em produção");
  if (url.origin !== raw)
    throw invalid("deve ser só a origem, sem caminho, barra final nem vírgula");
  return raw;
}
