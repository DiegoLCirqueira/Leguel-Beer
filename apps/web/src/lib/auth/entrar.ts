import { entrarSchema } from "@leguele/shared";
import type { ResultadoEntrada, Sessao } from "./gotrue";

export type EntradaLogin = { email: string; senha: string; manterConectado: boolean };

export type ResultadoEntrar =
  | { tipo: "ok"; sessao: Sessao; manterConectado: boolean }
  | { tipo: "invalido"; erros: Partial<Record<"email" | "senha", string>> }
  | { tipo: "credenciais" }
  | { tipo: "nao-confirmado"; email: string }
  | { tipo: "erro" };

interface Dependencias {
  auth: { signInPassword(email: string, senha: string): Promise<ResultadoEntrada> };
}

/** Valida com o schema compartilhado e entra; conta ou senha errada nunca dizem qual dado falhou. */
export async function entrar(
  entrada: EntradaLogin,
  { auth }: Dependencias,
): Promise<ResultadoEntrar> {
  const validacao = entrarSchema.safeParse(entrada);
  if (!validacao.success) {
    const erros: Partial<Record<"email" | "senha", string>> = {};
    for (const problema of validacao.error.issues) {
      const campo = problema.path[0];
      if ((campo === "email" || campo === "senha") && !erros[campo])
        erros[campo] = problema.message;
    }
    return { tipo: "invalido", erros };
  }

  const { email, senha, manterConectado } = validacao.data;
  const resultado = await auth.signInPassword(email, senha);
  if (resultado.tipo === "ok") return { tipo: "ok", sessao: resultado.sessao, manterConectado };
  if (resultado.tipo === "nao-confirmado") return { tipo: "nao-confirmado", email };
  return resultado;
}
