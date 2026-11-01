// ATENÇÃO: o caminho abaixo é interno do Next (não há export público equivalente para o cliente).
// Conferir em todo upgrade do Next que `next/dist/client/components/redirect-error` ainda existe
// e que a server action com `redirect()` continua rejeitando a promise com esse erro.
import { isRedirectError } from "next/dist/client/components/redirect-error";

/** True quando o erro é o redirect de uma server action (sucesso, não falha). */
export function ehErroDeRedirect(erro: unknown): boolean {
  return isRedirectError(erro);
}
