import { z } from "zod";
import { faixasDeFiltro, type Faixa } from "./faixas.js";

export const ORDENS_DO_CATALOGO = [
  "relevancia",
  "menor-preco",
  "maior-preco",
  "mais-novas",
] as const;

export type OrdemDoCatalogo = (typeof ORDENS_DO_CATALOGO)[number];

const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

function idDeFaixa(faixas: readonly Faixa[]) {
  return z.string().refine((id) => faixas.some((faixa) => faixa.id === id));
}

/** Valor inválido na URL é ignorado (volta ao padrão), nunca rejeitado: vale a spec do catálogo. */
export const catalogoQuerySchema = z.object({
  categoria: slugSchema.optional().catch(undefined),
  teor: idDeFaixa(faixasDeFiltro.teor).optional().catch(undefined),
  ibu: idDeFaixa(faixasDeFiltro.ibu).optional().catch(undefined),
  preco: idDeFaixa(faixasDeFiltro.preco).optional().catch(undefined),
  disponiveis: z.stringbool({ truthy: ["true"], falsy: ["false"], case: "sensitive" }).catch(false),
  ordem: z.enum(ORDENS_DO_CATALOGO).catch("relevancia"),
});

export type CatalogoQuery = z.infer<typeof catalogoQuerySchema>;
