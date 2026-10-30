/** A conta está autenticada, mas o papel dela não permite a rota. */
export class InsufficientRoleError extends Error {
  constructor() {
    super("Acesso negado.");
    this.name = "InsufficientRoleError";
  }
}
