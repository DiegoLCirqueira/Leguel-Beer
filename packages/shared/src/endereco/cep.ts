import { z } from "zod";

const MENSAGEM = "Informe o CEP.";

export const cepSchema = z
  .string(MENSAGEM)
  .transform((valor) => valor.replace(/\D/g, ""))
  .pipe(z.string().regex(/^\d{8}$/, MENSAGEM));
