import { z } from "zod";
import { cervejaCardSchema } from "../catalogo/cerveja-card.js";

export const itemValidadoSchema = z
  .object({
    cerveja: cervejaCardSchema,
    quantidade: z.int().positive(),
    totalCentavos: z.int().nonnegative(),
  })
  .refine((item) => item.quantidade <= item.cerveja.quantidadeDisponivel, {
    path: ["quantidade"],
    message: "A quantidade não pode passar da quantidade disponível.",
  });

export type ItemValidado = z.infer<typeof itemValidadoSchema>;
