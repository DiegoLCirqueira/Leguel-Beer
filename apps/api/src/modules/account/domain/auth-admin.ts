export interface AuthUser {
  id: string;
  email: string;
}

/** Porta para a administração de contas no provedor de autenticação (Supabase Auth). */
export interface AuthAdmin {
  findByEmail(email: string): Promise<AuthUser | null>;
  createConfirmedUser(email: string, password: string): Promise<AuthUser>;
}
