export type ResultadoDoCep =
  | { tipo: "ok"; rua: string; bairro: string; cidade: string; uf: "AL" }
  | { tipo: "nao-encontrado" | "fora-de-alagoas" | "indisponivel" | "invalido" };

export async function consultarCep(_cep: string): Promise<ResultadoDoCep> {
  return { tipo: "indisponivel" };
}
