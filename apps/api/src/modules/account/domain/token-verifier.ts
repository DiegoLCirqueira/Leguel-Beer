export interface AuthenticatedUser {
  id: string;
  email: string;
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
