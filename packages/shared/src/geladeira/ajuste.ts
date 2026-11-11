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

export const ajusteDaGeladeiraSchema = z.discriminatedUnion("tipo", [
  precoMudouSchema,
  indisponivelSchema,
]);

export type AjusteDaGeladeira = z.infer<typeof ajusteDaGeladeiraSchema>;
