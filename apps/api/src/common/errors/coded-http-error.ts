/**
 * Erro de negócio com status e código próprios (ex.: 503 `MAPS_UNAVAILABLE`, 422 `OUT_OF_DELIVERY_AREA`).
 * A mensagem é a do cliente: nunca leva stack, SQL nem dado pessoal.
 */
export class CodedHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    /** Campos próprios do código no corpo da resposta (ex.: `pedidoId`); nunca dado pessoal. */
    readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "CodedHttpError";
  }
}
