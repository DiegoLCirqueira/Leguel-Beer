import { z } from "zod";

const MENSAGEM = "Informe um telefone com DDD.";

/** Telefone brasileiro com DDD (10 ou 11 dígitos); aceita a máscara do formulário e guarda só os dígitos. */
export const telefoneSchema = z
  .string(MENSAGEM)
  .transform((valor) => valor.replace(/\D/g, ""))
  .pipe(z.string().regex(/^[1-9][1-9]\d{8,9}$/, MENSAGEM));
