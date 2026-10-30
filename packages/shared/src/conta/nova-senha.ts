import { z } from "zod";
import { senhaSchema } from "./senha.js";

/** Tela de nova senha. */
export const novaSenhaSchema = z
  .object({ senha: senhaSchema, confirmacao: z.string("As senhas não conferem.") })
  .refine((dados) => dados.senha === dados.confirmacao, {
    message: "As senhas não conferem.",
    path: ["confirmacao"],
  });

export type NovaSenhaForm = z.infer<typeof novaSenhaSchema>;
