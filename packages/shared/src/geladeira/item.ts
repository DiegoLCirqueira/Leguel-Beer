import { z } from "zod";

export const itemDaGeladeiraSchema = z.object({
  cervejaId: z.string(),
  quantidade: z.int(),
  precoVistoCentavos: z.int(),
});

export type ItemDaGeladeira = z.infer<typeof itemDaGeladeiraSchema>;
