import { z } from "zod";

export const cervejaCardSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nome: z.string(),
  estilo: z.string(),
  categoria: z.object({ slug: z.string(), nome: z.string(), ordem: z.number() }),
  teorAlcoolico: z.number(),
  ibu: z.number(),
  volumeMl: z.number(),
  precoCentavos: z.number(),
  destaque: z.boolean(),
  quantidadeDisponivel: z.number(),
  esgotada: z.boolean(),
  imagemUrl: z.string().nullable(),
  cadastradaEm: z.iso.datetime(),
});

export type CervejaCard = z.infer<typeof cervejaCardSchema>;
