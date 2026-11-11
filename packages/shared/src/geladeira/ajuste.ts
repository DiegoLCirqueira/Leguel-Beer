import { z } from "zod";

const precoMudouSchema = z.object({
  tipo: z.literal("preco-mudou"),
  cervejaId: z.string(),
  nome: z.string(),
  precoVistoCentavos: z.int().nonnegative(),
  precoAtualCentavos: z.int().nonnegative(),
});

export const ajusteDaGeladeiraSchema = z.discriminatedUnion("tipo", [precoMudouSchema]);

export type AjusteDaGeladeira = z.infer<typeof ajusteDaGeladeiraSchema>;
