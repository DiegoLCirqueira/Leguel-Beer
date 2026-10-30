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

type ValidacaoCadastro =
  | { ok: true; dados: ReturnType<typeof cadastroFormSchema.parse> }
  | { ok: false; erros: Partial<Record<CampoCadastro, string>> };

/** Valida com o schema compartilhado, o mesmo no formulário e no servidor: uma mensagem por campo. */
export function validarCadastro(entrada: EntradaCadastro): ValidacaoCadastro {
  const validacao = cadastroFormSchema.safeParse(entrada);
  if (validacao.success) return { ok: true, dados: validacao.data };
  const erros: Partial<Record<CampoCadastro, string>> = {};
  for (const problema of validacao.error.issues) {
    const campo = problema.path[0] as CampoCadastro | undefined;
    if (campo && !erros[campo]) erros[campo] = problema.message;
  }
  return { ok: false, erros };
}

/** Cadastra no Supabase Auth depois de validar. */
export async function criarConta(
  entrada: EntradaCadastro,
  { auth, redirectTo }: Dependencias,
): Promise<ResultadoCriarConta> {
  const validacao = validarCadastro(entrada);
  if (!validacao.ok) return { tipo: "invalido", erros: validacao.erros };

  const { email, senha, nome, telefone, aceite } = validacao.dados;
  const resultado = await auth.signUp({
    email,
    senha,
    metadata: { nome, telefone, aceite },
    redirectTo,
  });
  return resultado.tipo === "erro" ? resultado : { tipo: resultado.tipo, email };
}
