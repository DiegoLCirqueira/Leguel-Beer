import { z } from "zod";
import { nomeCompletoSchema } from "./nome.js";
import { telefoneSchema } from "./telefone.js";

/**
 * Corpo de "criar perfil". O e-mail e o id vêm do token e o papel do servidor;
 * por isso o objeto é estrito e recusa esses campos.
 */
export const criarPerfilRequestSchema = z.strictObject({
  nome: nomeCompletoSchema,
  telefone: telefoneSchema,
  aceite: z.literal(true, "Aceite os termos para criar sua conta."),
});

export type CriarPerfilRequest = z.infer<typeof criarPerfilRequestSchema>;

export const papelSchema = z.enum(["cliente", "admin"]);

export type Papel = z.infer<typeof papelSchema>;

export const perfilResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  nome: z.string(),
  telefone: z.string(),
  papel: papelSchema,
  aceite: z.object({
    termosVersao: z.string(),
    privacidadeVersao: z.string(),
    aceitoEm: z.iso.datetime(),
  }),
});

export type PerfilResponse = z.infer<typeof perfilResponseSchema>;
