import { z } from "zod";
import { itemDaGeladeiraSchema } from "./item.js";

export const geladeiraRequestSchema = z.object({
  itens: z.array(itemDaGeladeiraSchema),
});

export type GeladeiraRequest = z.infer<typeof geladeiraRequestSchema>;
