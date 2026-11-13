import { z } from "zod";
import { cepSchema } from "./cep.js";

const ate = (limite: number) => `Use até ${limite} caracteres.`;
const obrigatorio = (mensagem: string, limite: number) =>
  z.string(mensagem).trim().min(1, mensagem).max(limite, ate(limite));
const opcional = (limite: number) =>
  z
    .string()
    .trim()
    .max(limite, ate(limite))
    .transform((valor) => (valor === "" ? undefined : valor))
    .optional();

export const enderecoFormSchema = z.object({
  apelido: opcional(30),
  cep: cepSchema,
  rua: obrigatorio("Informe a rua.", 120),
  numero: obrigatorio("Informe o número.", 10),
  complemento: opcional(60),
  bairro: obrigatorio("Informe o bairro.", 80),
  cidade: obrigatorio("Informe a cidade.", 80),
  uf: z.literal("AL", "Por enquanto só entregamos em Alagoas."),
});
