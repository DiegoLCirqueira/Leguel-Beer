import { z } from "zod";

/** Os dois alertas do início do admin. */
export const resumoDoAdminSchema = z.object({
  cervejasComEstoqueBaixo: z.int().nonnegative(),
  pedidosPagosAguardandoPreparo: z.int().nonnegative(),
});

export type ResumoDoAdmin = z.infer<typeof resumoDoAdminSchema>;
