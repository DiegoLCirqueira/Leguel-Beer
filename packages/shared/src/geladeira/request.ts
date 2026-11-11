import { z } from "zod";
import { itemDaGeladeiraSchema } from "./item.js";
import { ITENS_MAXIMOS_NA_GELADEIRA } from "./limites.js";

export const geladeiraRequestSchema = z.object({
  itens: z
    .array(itemDaGeladeiraSchema)
    .max(ITENS_MAXIMOS_NA_GELADEIRA)
    .refine((itens) => new Set(itens.map((item) => item.cervejaId)).size === itens.length, {
      message: "Cada cerveja aparece uma só vez na Geladeira.",
    }),
});

export type GeladeiraRequest = z.infer<typeof geladeiraRequestSchema>;
