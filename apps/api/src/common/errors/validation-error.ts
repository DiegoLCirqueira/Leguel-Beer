export interface FieldIssue {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(readonly issues: FieldIssue[]) {
    super("Dados inválidos.");
  }
}
