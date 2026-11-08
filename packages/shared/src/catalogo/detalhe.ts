import { z } from "zod";
import { cervejaCardSchema } from "./cerveja-card.js";
import { calcularDesconto } from "./desconto.js";

/** O card mais os dados da página de produto. `safeExtend` mantém a regra de `esgotada` do card. */
export const cervejaDetalheSchema = cervejaCardSchema
  .safeExtend({
    descricao: z.string().min(1).nullable(),
    precoAnteriorCentavos: z.int().nonnegative().nullable(),
    descontoPercentual: z.int().nullable(),
  })
  .refine(
    (cerveja) =>
      cerveja.descontoPercentual ===
      calcularDesconto(cerveja.precoAnteriorCentavos, cerveja.precoCentavos),
    {
      path: ["descontoPercentual"],
      message: "O desconto deve ser calculado a partir do preço anterior e do preço atual.",
    },
  );

export type CervejaDetalhe = z.infer<typeof cervejaDetalheSchema>;
