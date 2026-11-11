import { z } from "zod";
import { ajusteDaGeladeiraSchema } from "./ajuste.js";
import { itemValidadoSchema } from "./item-validado.js";

export const geladeiraResponseSchema = z.object({
  itens: z.array(itemValidadoSchema),
  ajustes: z.array(ajusteDaGeladeiraSchema),
  quantidadeTotal: z.int().nonnegative(),
  subtotalCentavos: z.int().nonnegative(),
});

export type GeladeiraResponse = z.infer<typeof geladeiraResponseSchema>;
