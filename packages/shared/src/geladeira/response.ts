import { z } from "zod";
import { ajusteDaGeladeiraSchema } from "./ajuste.js";
import { itemValidadoSchema } from "./item-validado.js";
import { resumirGeladeira } from "./resumo.js";

export const geladeiraResponseSchema = z
  .object({
    itens: z.array(itemValidadoSchema),
    ajustes: z.array(ajusteDaGeladeiraSchema),
    quantidadeTotal: z.int().nonnegative(),
    subtotalCentavos: z.int().nonnegative(),
  })
  .refine((resposta) => resposta.quantidadeTotal === resumirGeladeira(resposta.itens).quantidadeTotal, {
    path: ["quantidadeTotal"],
    message: "A quantidade total deve ser a soma das unidades dos itens.",
  })
  .refine((resposta) => resposta.subtotalCentavos === resumirGeladeira(resposta.itens).subtotalCentavos, {
    path: ["subtotalCentavos"],
    message: "O subtotal deve ser a soma dos totais dos itens.",
  });

export type GeladeiraResponse = z.infer<typeof geladeiraResponseSchema>;
