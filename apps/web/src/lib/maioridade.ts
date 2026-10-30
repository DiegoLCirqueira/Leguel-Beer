const DESTINO_PADRAO = "/boas-vindas";
const PERGUNTA = "/maioridade";

// Só caminhos do próprio site: qualquer outro endereço cai na boas-vindas (sem redirecionamento aberto).
export function retornoSeguro(retorno: string | undefined): string {
  if (!retorno || retorno === "/") return DESTINO_PADRAO;
  const interno = retorno.startsWith("/") && !retorno.startsWith("//") && !retorno.includes("\\");
  // eslint-disable-next-line no-control-regex
  if (!interno || /[\u0000-\u001f]/.test(retorno)) return DESTINO_PADRAO;
  if (retorno === PERGUNTA || retorno.startsWith(`${PERGUNTA}?`)) return DESTINO_PADRAO;
  return retorno;
}

export const MAIORIDADE_COOKIE = "leguele_maioridade";
export const MAIORIDADE_VALIDADE_DIAS = 30;
export const MAIORIDADE_VALIDADE_MS = MAIORIDADE_VALIDADE_DIAS * 24 * 60 * 60 * 1000;
