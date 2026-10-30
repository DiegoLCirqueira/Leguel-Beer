import { z } from "zod";
import { emailSchema } from "./email.js";

/** Formulário de entrar: a senha só precisa existir; o mínimo vale para criar ou trocar a senha. */
export const entrarSchema = z.object({
  email: emailSchema,
  senha: z.string("Informe sua senha.").min(1, "Informe sua senha."),
  manterConectado: z.boolean().default(false),
});

export type EntrarForm = z.infer<typeof entrarSchema>;

export const recuperarSenhaSchema = z.object({ email: emailSchema });

export type RecuperarSenhaForm = z.infer<typeof recuperarSenhaSchema>;
