import { cadastroFormSchema } from "@leguele/shared";
import type { DadosCadastro, ResultadoCadastro } from "./gotrue";

export type CampoCadastro = "nome" | "email" | "telefone" | "senha" | "confirmacao" | "aceite";

export type EntradaCadastro = {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmacao: string;
  aceite: boolean;
};

export type ResultadoCriarConta =
  | { tipo: "enviado"; email: string }
  | { tipo: "email-ja-cadastrado"; email: string }
  | { tipo: "invalido"; erros: Partial<Record<CampoCadastro, string>> }
  | { tipo: "erro" };

interface Dependencias {
  auth: { signUp(dados: DadosCadastro): Promise<ResultadoCadastro> };
  redirectTo: string;
}

/** Valida com o schema compartilhado (o mesmo do formulário) e cadastra no Supabase Auth. */
export async function criarConta(
  entrada: EntradaCadastro,
  { auth, redirectTo }: Dependencias,
): Promise<ResultadoCriarConta> {
  const validacao = cadastroFormSchema.safeParse(entrada);
  if (!validacao.success) {
    const erros: Partial<Record<CampoCadastro, string>> = {};
    for (const problema of validacao.error.issues) {
      const campo = problema.path[0] as CampoCadastro | undefined;
      if (campo && !erros[campo]) erros[campo] = problema.message;
    }
    return { tipo: "invalido", erros };
  }

  const { email, senha, nome, telefone, aceite } = validacao.data;
  const resultado = await auth.signUp({
    email,
    senha,
    metadata: { nome, telefone, aceite },
    redirectTo,
  });
  return resultado.tipo === "erro" ? resultado : { tipo: resultado.tipo, email };
}
