export type DestinoDoVoltar = "voltar" | "/criar-conta" | "/boas-vindas";

interface Entrada {
  /** `document.referrer`: a página de onde a pessoa chegou, ou vazio. */
  referrer: string;
  /** `location.origin`: a origem do próprio site. */
  origem: string;
  /** `history.length`: 1 numa aba nova, sem página anterior para voltar. */
  tamanhoDoHistorico: number;
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
 * Para onde o botão de voltar das páginas legais leva. Quem veio de outra página do site volta na
 * história. Numa aba nova (os termos abrem em nova aba a partir do cadastro) não há para onde voltar
 * na história: vai ao /criar-conta se veio de lá, e à boas-vindas nos demais casos. Fechar a aba não
 * serve: o navegador só deixa o script fechar abas que ele mesmo abriu.
 */
export function destinoDoVoltar({
  referrer,
  origem,
  tamanhoDoHistorico,
}: Entrada): DestinoDoVoltar {
  const caminho = caminhoDoSite(referrer, origem);
  if (caminho === undefined) return "/boas-vindas";
  if (tamanhoDoHistorico > 1) return "voltar";
  return caminho === "/criar-conta" || caminho.startsWith("/criar-conta/")
    ? "/criar-conta"
    : "/boas-vindas";
}
