import { z } from "zod";

export const cervejaDoAdminSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  nome: z.string().min(1),
  categoria: z.object({ slug: z.string().min(1), nome: z.string().min(1) }),
  estilo: z.string().min(1),
  descricao: z.string().nullable(),
  precoCentavos: z.int().positive(),
  precoAnteriorCentavos: z.int().positive().nullable(),
  volumeMl: z.int().positive(),
  teorAlcoolico: z.number().nonnegative(),
  ibu: z.int().nonnegative(),
  /** Estoque físico (reservas não entram). */
  estoqueFisico: z.int().nonnegative(),
  estoqueMinimo: z.int().nonnegative(),
  destaque: z.boolean(),
  ativa: z.boolean(),
  imagemUrl: z.string().nullable(),
  cadastradaEm: z.iso.datetime(),
});

export type CervejaDoAdmin = z.infer<typeof cervejaDoAdminSchema>;

export const listaDeCervejasDoAdminSchema = z.object({ cervejas: z.array(cervejaDoAdminSchema) });
export type ListaDeCervejasDoAdmin = z.infer<typeof listaDeCervejasDoAdminSchema>;

/** Consulta da lista do admin: busca por nome e filtro Todas / Ativas / Inativas. */
export const consultaDeCervejasDoAdminSchema = z.object({
  busca: z.string().trim().max(80).optional(),
  estado: z.enum(["todas", "ativas", "inativas"]).default("todas"),
});
export type ConsultaDeCervejasDoAdmin = z.infer<typeof consultaDeCervejasDoAdminSchema>;
