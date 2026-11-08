/** Com quantidade disponível de 1 até este limiar a página de produto avisa "Últimas N unidades". */
export const LIMIAR_ESTOQUE_BAIXO = 5;

export function estoqueBaixo(quantidadeDisponivel: number): boolean {
  return quantidadeDisponivel <= LIMIAR_ESTOQUE_BAIXO;
}
