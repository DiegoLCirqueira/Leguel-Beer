import { z } from "zod";

export const confirmacaoDoPagamentoSchema = z.object({ emailEnviado: z.boolean() });
