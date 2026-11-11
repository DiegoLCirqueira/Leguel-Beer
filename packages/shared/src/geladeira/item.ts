import { z } from "zod";
import { QUANTIDADE_MAXIMA_POR_ITEM } from "./limites.js";

export const itemDaGeladeiraSchema = z.object({
  cervejaId: z.string(),
  quantidade: z.int().min(1).max(QUANTIDADE_MAXIMA_POR_ITEM),
  precoVistoCentavos: z.int().nonnegative(),
});

export type ItemDaGeladeira = z.infer<typeof itemDaGeladeiraSchema>;
