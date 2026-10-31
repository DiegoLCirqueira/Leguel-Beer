const API_LOCAL = "http://localhost:3333";

/**
 * Endereço da API (API_URL). Em produção a falta dele é erro de configuração e falha alto; fora
 * dela, sem API_URL, vale a API local. Fonte única para as ações e para o proxy.
 */
export function urlDaApi(): string {
  const configurada = process.env.API_URL;
  if (configurada) return configurada;
  if (process.env.NODE_ENV === "production") {
    throw new Error("API_URL é obrigatória em produção (endereço da API do Leguelé Beer).");
  }
  return API_LOCAL;
}
