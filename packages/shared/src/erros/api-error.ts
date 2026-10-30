import { z } from "zod";

export const fieldIssueSchema = z.object({ field: z.string(), message: z.string() });

export type FieldIssue = z.infer<typeof fieldIssueSchema>;

/** Formato de erro da API: `{ code, message, details? }`. */
export const apiErrorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(fieldIssueSchema).optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: FieldIssue[] | undefined;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code;
    this.details = body.details;
  }

  /** Converte o corpo de uma resposta de erro; um corpo fora do formato vira um erro genérico. */
  static fromBody(status: number, body: unknown): ApiError {
    const parsed = apiErrorBodySchema.safeParse(body);
    return new ApiError(
      status,
      parsed.success
        ? parsed.data
        : { code: "HTTP_ERROR", message: "Não foi possível processar a requisição." },
    );
  }
}
