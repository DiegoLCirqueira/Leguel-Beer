import { z } from "zod";
import { cervejaCardSchema } from "../catalogo/cerveja-card.js";

export const itemValidadoSchema = z.object({
  cerveja: cervejaCardSchema,
  quantidade: z.int(),
  totalCentavos: z.int().nonnegative(),
});

export type ItemValidado = z.infer<typeof itemValidadoSchema>;
