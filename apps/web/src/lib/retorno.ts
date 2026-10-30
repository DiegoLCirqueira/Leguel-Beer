const TELAS_DE_ACESSO = ["/entrar", "/criar-conta", "/maioridade"];

/**
 * Só caminhos do próprio site (sem redirecionamento aberto) e nunca uma tela de acesso, para a
 * pessoa não voltar para a tela de onde acabou de sair. Qualquer outro valor cai no destino padrão.
 */
export function retornoInterno(retorno: string | undefined, padrao: string): string {
  if (!retorno) return padrao;
  const interno = retorno.startsWith("/") && !retorno.startsWith("//") && !retorno.includes("\\");
  // eslint-disable-next-line no-control-regex
  if (!interno || /[\u0000-\u001f]/.test(retorno)) return padrao;
  // Sem a barra final: "/entrar/" é a mesma tela.
  const caminho = (retorno.split(/[?#]/)[0] ?? retorno).replace(/\/+$/, "");
  if (TELAS_DE_ACESSO.includes(caminho)) return padrao;
  return retorno;
}
