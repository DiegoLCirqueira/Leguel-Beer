/** `"voltar"` (voltar na história) ou o caminho de reserva para onde o link leva. */
export type DestinoDoVoltar = string;

interface Entrada {
  /** `document.referrer`: a página de onde a pessoa chegou, ou vazio. */
  referrer: string;
  /** `location.origin`: a origem do próprio site. */
  origem: string;
  /** `history.length`: 1 numa aba nova, sem página anterior para voltar. */
  tamanhoDoHistorico: number;
  /**
   * `true` quando a página atual foi aberta por uma navegação dentro do site (sem recarregar):
   * nesse caso o `document.referrer` continua o da primeira página e não diz de onde a pessoa veio.
   */
  navegouNoSite?: boolean;
  /** Para onde levar quando não há página anterior do site na história (padrão: /boas-vindas). */
  reserva?: string;
}

function caminhoDoSite(referrer: string, origem: string): string | undefined {
  try {
    const url = new URL(referrer);
    return url.origin === origem ? url.pathname : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Para onde um botão de voltar leva (páginas legais e página de produto). Quem veio de outra página do site volta na
 * história. Numa aba nova (os termos abrem em nova aba a partir do cadastro) não há para onde voltar
 * na história: vai ao /criar-conta se veio de lá, e à boas-vindas nos demais casos. Fechar a aba não
 * serve: o navegador só deixa o script fechar abas que ele mesmo abriu.
 */
export function destinoDoVoltar({
  referrer,
  origem,
  tamanhoDoHistorico,
  navegouNoSite = false,
  reserva = "/boas-vindas",
}: Entrada): DestinoDoVoltar {
  if (navegouNoSite) return tamanhoDoHistorico > 1 ? "voltar" : reserva;
  const caminho = caminhoDoSite(referrer, origem);
  if (caminho === undefined) return reserva;
  if (tamanhoDoHistorico > 1) return "voltar";
  return caminho === "/criar-conta" || caminho.startsWith("/criar-conta/")
    ? "/criar-conta"
    : reserva;
}
