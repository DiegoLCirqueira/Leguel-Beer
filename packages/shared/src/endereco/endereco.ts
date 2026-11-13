import { z } from "zod";
import { cepSchema } from "./cep.js";

const obrigatorio = (mensagem: string) => z.string(mensagem).trim().min(1, mensagem);

export const enderecoFormSchema = z.object({
  apelido: z.string().optional(),
  cep: cepSchema,
  rua: obrigatorio("Informe a rua."),
  numero: obrigatorio("Informe o número."),
  complemento: z.string().optional(),
  bairro: obrigatorio("Informe o bairro."),
  cidade: obrigatorio("Informe a cidade."),
  uf: z.literal("AL", "Por enquanto só entregamos em Alagoas."),
});
