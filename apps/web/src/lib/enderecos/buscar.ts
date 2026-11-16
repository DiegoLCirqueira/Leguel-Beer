import type { EnderecoResposta } from "@leguele/shared";

export type ResultadoDosEnderecos =
  | { tipo: "ok"; enderecos: EnderecoResposta[] }
  | { tipo: "sem-sessao" }
  | { tipo: "erro" };

export async function buscarEnderecos(_token: string): Promise<ResultadoDosEnderecos> {
  return { tipo: "erro" };
}
