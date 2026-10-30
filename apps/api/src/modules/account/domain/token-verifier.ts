export interface AuthenticatedUser {
  id: string;
  email: string;
  /**
   * O token traz `user_metadata.email_verified` verdadeiro. Atenção: o usuário consegue editar o
   * próprio `user_metadata`; a garantia de verdade é `enable_confirmations` ligado no Supabase
   * (sem confirmar o e-mail, nenhum token é emitido). Esta prova é uma segunda trava.
   */
  emailVerified: boolean;
}

/** O token está ausente, malformado, expirado, adulterado ou de um tipo que a API não aceita. */
export class InvalidTokenError extends Error {
  constructor(reason: string) {
    super(`Token inválido: ${reason}`);
    this.name = "InvalidTokenError";
  }
}

/** Porta para validar o JWT do provedor de autenticação (Supabase Auth). */
export interface TokenVerifier {
  verify(token: string): Promise<AuthenticatedUser>;
}
