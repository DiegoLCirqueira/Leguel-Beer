import { z } from "zod";

/**
 * Cotação de frete como a API a devolve ao site: o valor (em centavos) e se é grátis, ou só a marca de
 * "fora da área". Nunca leva distância, coordenadas nem origem.
 */
export const cotacaoDeFreteSchema = z.discriminatedUnion("naArea", [
  z.object({
    naArea: z.literal(true),
    freteCentavos: z.number().int().min(0),
    gratis: z.boolean(),
  }),
  z.object({ naArea: z.literal(false) }),
]);

export type CotacaoDeFrete = z.output<typeof cotacaoDeFreteSchema>;
