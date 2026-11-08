import { z } from "zod";
import { cervejaCardSchema } from "./cerveja-card.js";

/** O card mais os dados da página de produto. `safeExtend` mantém a regra de `esgotada` do card. */
export const cervejaDetalheSchema = cervejaCardSchema.safeExtend({
  descricao: z.string().nullable(),
  precoAnteriorCentavos: z.number().nullable(),
  descontoPercentual: z.number().nullable(),
});

export type CervejaDetalhe = z.infer<typeof cervejaDetalheSchema>;
