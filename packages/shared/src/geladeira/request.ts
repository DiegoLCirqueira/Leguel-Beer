import { z } from "zod";
import { itemDaGeladeiraSchema } from "./item.js";

export const geladeiraRequestSchema = z.object({
  itens: z.array(itemDaGeladeiraSchema).refine(
    (itens) => new Set(itens.map((item) => item.cervejaId)).size === itens.length,
    { message: "Cada cerveja aparece uma só vez na Geladeira." },
  ),
});

export type GeladeiraRequest = z.infer<typeof geladeiraRequestSchema>;
