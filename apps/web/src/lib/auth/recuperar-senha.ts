import { novaSenhaSchema, recuperarSenhaSchema } from "@leguele/shared";
import type { Sessao } from "./gotrue";

export type ResultadoPedido =
  { tipo: "enviado" } | { tipo: "invalido"; erros: { email?: string } } | { tipo: "erro" };

/**
 * Pede o link de recuperação. O aviso é sempre o mesmo, exista ou não a conta, e o limite de
 * pedidos (1 por minuto por e-mail) também mostra o aviso: nada revela se o e-mail tem conta.
 */
export async function pedirRecuperacao(
  entrada: { email: string },
  {
    auth,
    redirectTo,
  }: {
    auth: { recover(email: string, redirectTo: string): Promise<"enviado" | "limite" | "erro"> };
    redirectTo: string;
  },
): Promise<ResultadoPedido> {
  const validacao = recuperarSenhaSchema.safeParse(entrada);
  if (!validacao.success) {
    return { tipo: "invalido", erros: { email: validacao.error.issues[0]?.message } };
  }
  const resultado = await auth.recover(validacao.data.email, redirectTo);
  return resultado === "erro" ? { tipo: "erro" } : { tipo: "enviado" };
}

export type EntradaNovaSenha = {
  tokenHash: string;
  type: string;
  senha: string;
  confirmacao: string;
};

export type ResultadoNovaSenha =
  | { tipo: "ok"; sessao: Sessao }
  | { tipo: "invalido"; erros: Partial<Record<"senha" | "confirmacao", string>> }
  | { tipo: "link-invalido" }
  /** O link já foi gasto no verify, mas o Supabase não salvou a senha: é preciso pedir outro. */
  | { tipo: "senha-nao-salva" }
  | { tipo: "erro" };

interface DependenciasNovaSenha {
  auth: {
    verify(dados: { tokenHash: string; type: "recovery" }): Promise<Sessao | null>;
    updatePassword(accessToken: string, senha: string): Promise<boolean>;
    signOutOthers(accessToken: string): Promise<boolean>;
  };
}

/**
 * Define a nova senha. A senha é validada ANTES de gastar o link; o link só é consumido aqui, no
 * POST, nunca ao abrir a página (scanners de e-mail abrem links). Depois de trocar, as outras
 * sessões da conta são encerradas.
 */
export async function definirNovaSenha(
  entrada: EntradaNovaSenha,
  { auth }: DependenciasNovaSenha,
): Promise<ResultadoNovaSenha> {
  const validacao = novaSenhaSchema.safeParse({
    senha: entrada.senha,
    confirmacao: entrada.confirmacao,
  });
  if (!validacao.success) {
    const erros: Partial<Record<"senha" | "confirmacao", string>> = {};
    for (const problema of validacao.error.issues) {
      const campo = problema.path[0];
      if ((campo === "senha" || campo === "confirmacao") && !erros[campo]) {
        erros[campo] = problema.message;
      }
    }
    return { tipo: "invalido", erros };
  }

  if (!entrada.tokenHash || entrada.type !== "recovery") return { tipo: "link-invalido" };

  const sessao = await auth.verify({ tokenHash: entrada.tokenHash, type: "recovery" });
  if (!sessao) return { tipo: "link-invalido" };

  if (!(await auth.updatePassword(sessao.accessToken, validacao.data.senha))) {
    return { tipo: "senha-nao-salva" };
  }
  // A spec diz que as outras sessões são encerradas: tenta de novo uma vez e, se falhar, registra
  // a falha (sem dados pessoais). A senha já mudou, então a pessoa entra mesmo assim.
  const encerrou =
    (await auth.signOutOthers(sessao.accessToken)) ||
    (await auth.signOutOthers(sessao.accessToken));
  if (!encerrou) {
    console.error(
      "[nova-senha] não foi possível encerrar as outras sessões depois de trocar a senha",
    );
  }
  return { tipo: "ok", sessao };
}
