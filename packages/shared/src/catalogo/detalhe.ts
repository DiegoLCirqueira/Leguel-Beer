import { z } from "zod";
import { cervejaCardSchema } from "./cerveja-card.js";

/** O card mais os dados da página de produto. `safeExtend` mantém a regra de `esgotada` do card. */
export const cervejaDetalheSchema = cervejaCardSchema.safeExtend({
  descricao: z.string().min(1).nullable(),
  precoAnteriorCentavos: z.int().nonnegative().nullable(),
  descontoPercentual: z.int().nullable(),
});

export type CervejaDetalhe = z.infer<typeof cervejaDetalheSchema>;
