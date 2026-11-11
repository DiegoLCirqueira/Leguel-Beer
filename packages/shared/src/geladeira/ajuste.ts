import { z } from "zod";

const precoMudouSchema = z.object({
  tipo: z.literal("preco-mudou"),
  cervejaId: z.string(),
  nome: z.string(),
  precoVistoCentavos: z.int().nonnegative(),
  precoAtualCentavos: z.int().nonnegative(),
});

const indisponivelSchema = z.object({
  tipo: z.literal("indisponivel"),
  cervejaId: z.string(),
  nome: z.string().nullable(),
});

const quantidadeReduzidaSchema = z
  .object({
    tipo: z.literal("quantidade-reduzida"),
    cervejaId: z.string(),
    nome: z.string(),
    quantidadeAnterior: z.int().positive(),
    quantidadeAtual: z.int().positive(),
  })
  .refine((ajuste) => ajuste.quantidadeAtual < ajuste.quantidadeAnterior, {
    path: ["quantidadeAtual"],
    message: "A quantidade atual deve ser menor que a anterior.",
  });

export const ajusteDaGeladeiraSchema = z.discriminatedUnion("tipo", [
  precoMudouSchema,
  indisponivelSchema,
  quantidadeReduzidaSchema,
]);

export type AjusteDaGeladeira = z.infer<typeof ajusteDaGeladeiraSchema>;
