import { z } from "zod";
import { nomeCompletoSchema } from "./nome.js";
import { dataDeNascimentoSchema } from "./nascimento.js";
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

/**
 * Corpo de "editar perfil" (substitui os dados editáveis). A data de nascimento é opcional: ausente,
 * nula ou em branco guarda `null`. E-mail, id, papel e aceite dos termos não mudam por aqui, então
 * o objeto é estrito e recusa esses campos.
 */
export const editarPerfilRequestSchema = z.strictObject({
  nome: nomeCompletoSchema,
  telefone: telefoneSchema,
  dataNascimento: z.preprocess(
    (valor) => (valor === undefined || valor === "" ? null : valor),
    dataDeNascimentoSchema.nullable(),
  ),
});

export type EditarPerfilRequest = z.output<typeof editarPerfilRequestSchema>;

export const papelSchema = z.enum(["cliente", "admin"]);

export type Papel = z.infer<typeof papelSchema>;

/** Resposta de GET /me/role: só o papel, sem exigir perfil completo. */
export const papelResponseSchema = z.object({ papel: papelSchema });

export type PapelResponse = z.infer<typeof papelResponseSchema>;

export const perfilResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  nome: z.string(),
  telefone: z.string(),
  /** "AAAA-MM-DD", ou null enquanto o cliente não informou. */
  dataNascimento: z.iso.date().nullable().default(null),
  papel: papelSchema,
  aceite: z.object({
    termosVersao: z.string(),
    privacidadeVersao: z.string(),
    aceitoEm: z.iso.datetime(),
  }),
});

export type PerfilResponse = z.infer<typeof perfilResponseSchema>;
