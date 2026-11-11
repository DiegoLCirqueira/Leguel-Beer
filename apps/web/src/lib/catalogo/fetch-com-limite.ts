/** Uma API que não responde não pode deixar a tela esperando: passou disso, a busca é abortada. */
export const TEMPO_LIMITE_MS = 8000;

/**
 * GET sem cache com limite de 8 segundos, valendo também para a leitura do corpo (`tratar`).
 * Lança se a rede falhar ou o limite estourar: quem chama decide o estado de erro.
 */
export async function buscarComLimite<T>(
  url: string,
  tratar: (resposta: Response) => Promise<T>,
): Promise<T> {
  const controle = new AbortController();
  const limite = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetch(url, { cache: "no-store", signal: controle.signal });
    return await tratar(resposta);
  } finally {
    clearTimeout(limite);
  }
}
