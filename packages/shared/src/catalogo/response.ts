import { z } from "zod";
import { cervejaCardSchema } from "./cerveja-card.js";

export const categoriaComContadorSchema = z.object({
  slug: z.string(),
  nome: z.string(),
  ordem: z.int(),
  quantidade: z.int().positive(),
});

export type CategoriaComContador = z.infer<typeof categoriaComContadorSchema>;

export const catalogoResponseSchema = z.object({
  itens: z.array(cervejaCardSchema),
  total: z.int().nonnegative(),
  categorias: z.array(categoriaComContadorSchema),
});

export type CatalogoResponse = z.infer<typeof catalogoResponseSchema>;
