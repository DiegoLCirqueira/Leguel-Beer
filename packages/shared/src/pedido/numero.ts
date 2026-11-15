import { z } from "zod";

export const numeroDoPedidoSchema = z.string().regex(/^#LB\d{6}$/);
