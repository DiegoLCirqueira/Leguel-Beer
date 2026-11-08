import { z } from "zod";

export const ORDENS_DO_CATALOGO = ["relevancia", "menor-preco", "maior-preco", "mais-novas"] as const;

export const catalogoQuerySchema = z.object({
  ordem: z.enum(ORDENS_DO_CATALOGO).default("relevancia"),
  disponiveis: z.boolean().default(false),
});
