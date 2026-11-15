import { z } from "zod";

const MENSAGEM = "Informe o CEP.";
const MENSAGEM_FORA_DE_ALAGOAS = "Por enquanto só entregamos em Alagoas.";

export const cepSchema = z
  .string(MENSAGEM)
  .regex(/^[\d\s-]*$/, MENSAGEM)
  .transform((valor) => valor.replace(/\D/g, ""))
  .pipe(
    z
      .string()
      .regex(/^\d{8}$/, MENSAGEM)
      .regex(/^57/, MENSAGEM_FORA_DE_ALAGOAS),
  );
