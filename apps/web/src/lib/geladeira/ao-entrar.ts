import type { EstadoDaGeladeira } from "./estado";

export function resolverAoEntrar(entrada: {
  convidado: EstadoDaGeladeira;
  conta: EstadoDaGeladeira;
}): { geladeira: EstadoDaGeladeira; enviarParaConta: boolean } {
  return { geladeira: entrada.convidado, enviarParaConta: false };
}
