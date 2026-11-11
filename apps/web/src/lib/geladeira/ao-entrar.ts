import type { EstadoDaGeladeira } from "./estado";

/**
 * Regra ao entrar na conta: se a Geladeira da conta está vazia e a do convidado não, a do convidado
 * passa para a conta; se a da conta tem itens, vale a da conta e a do convidado é descartada.
 * Somar as duas é o LB-48 (MVP+).
 */
export function resolverAoEntrar({
  convidado,
  conta,
}: {
  convidado: EstadoDaGeladeira;
  conta: EstadoDaGeladeira;
}): { geladeira: EstadoDaGeladeira; enviarParaConta: boolean } {
  if (conta.itens.length === 0 && convidado.itens.length > 0) {
    return { geladeira: convidado, enviarParaConta: true };
  }
  return { geladeira: conta, enviarParaConta: false };
}
