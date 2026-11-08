import { z } from "zod";
import { faixasDeFiltro, type Faixa } from "./faixas.js";

export const ORDENS_DO_CATALOGO = [
  "relevancia",
  "menor-preco",
  "maior-preco",
  "mais-novas",
] as const;

const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

function idDeFaixa(faixas: readonly Faixa[]) {
  return z.string().refine((id) => faixas.some((faixa) => faixa.id === id));
}

export const catalogoQuerySchema = z.object({
  categoria: slugSchema.optional(),
  teor: idDeFaixa(faixasDeFiltro.teor).optional(),
  ibu: idDeFaixa(faixasDeFiltro.ibu).optional(),
  preco: idDeFaixa(faixasDeFiltro.preco).optional(),
  disponiveis: z.stringbool({ truthy: ["true"], falsy: ["false"] }).default(false),
  ordem: z.enum(ORDENS_DO_CATALOGO).default("relevancia"),
});
