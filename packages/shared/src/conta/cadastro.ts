import { z } from "zod";
import { emailSchema } from "./email.js";
import { nomeCompletoSchema } from "./nome.js";
import { senhaSchema } from "./senha.js";
import { telefoneSchema } from "./telefone.js";

/** Formulário "Criar sua conta" ([[cadastro-login]]). */
export const cadastroFormSchema = z
  .object({
    nome: nomeCompletoSchema,
    email: emailSchema,
    telefone: telefoneSchema,
    senha: senhaSchema,
    confirmacao: z.string("As senhas não conferem."),
    aceite: z.literal(true, "Aceite os termos para criar sua conta."),
  })
  .refine((dados) => dados.senha === dados.confirmacao, {
    message: "As senhas não conferem.",
    path: ["confirmacao"],
  });

export type CadastroForm = z.infer<typeof cadastroFormSchema>;
