import { z } from "zod";

export const nomeCompletoSchema = z
  .string("Informe seu nome completo.")
  .trim()
  .min(1, "Informe seu nome completo.")
  .max(120, "O nome pode ter até 120 caracteres.");
