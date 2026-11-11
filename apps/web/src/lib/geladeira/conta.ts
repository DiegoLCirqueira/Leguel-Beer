import type { GeladeiraRequest, GeladeiraResponse } from "@leguele/shared";

/** O que as Server Actions da conta devolvem (nunca lançam): a tela decide o que fazer com cada caso. */
export type ResultadoDaConta =
  | { tipo: "ok"; resposta: GeladeiraResponse }
  | { tipo: "sem-sessao" }
  | { tipo: "sem-perfil" }
  | { tipo: "erro" };

export interface ContaDaGeladeira {
  buscar: () => Promise<ResultadoDaConta>;
  enviar: (request: GeladeiraRequest) => Promise<ResultadoDaConta>;
}
