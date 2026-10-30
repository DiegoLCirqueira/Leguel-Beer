/** O recurso não existe ou não pertence a quem pediu: as duas situações são indistinguíveis. */
export class NotFoundError extends Error {
  constructor() {
    super("Recurso não encontrado.");
    this.name = "NotFoundError";
  }
}
