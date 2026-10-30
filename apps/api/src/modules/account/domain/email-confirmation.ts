/** Porta: o provedor de autenticação confirma, no servidor, que o e-mail da conta foi confirmado. */
export interface EmailConfirmation {
  isConfirmed(userId: string): Promise<boolean>;
}
