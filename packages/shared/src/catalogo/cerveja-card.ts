import { z } from "zod";

export const cervejaCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nome: z.string(),
  estilo: z.string(),
  categoria: z.object({ slug: z.string(), nome: z.string(), ordem: z.int() }),
  teorAlcoolico: z.number(),
  ibu: z.int().nonnegative(),
  volumeMl: z.int().positive(),
  precoCentavos: z.int().nonnegative(),
  destaque: z.boolean(),
  quantidadeDisponivel: z.int().nonnegative(),
  esgotada: z.boolean(),
  imagemUrl: z.string().nullable(),
  cadastradaEm: z.iso.datetime(),
});

export type CervejaCard = z.infer<typeof cervejaCardSchema>;
