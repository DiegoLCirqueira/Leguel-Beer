import { z } from "zod";
import { cepSchema } from "./cep.js";

export const enderecoFormSchema = z.object({
  apelido: z.string().optional(),
  cep: cepSchema,
  rua: z.string(),
  numero: z.string(),
  complemento: z.string().optional(),
  bairro: z.string(),
  cidade: z.string(),
  uf: z.string(),
});
