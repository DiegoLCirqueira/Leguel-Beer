import { z } from "zod";
import { cervejaCardSchema } from "./cerveja-card.js";

export const destaquesResponseSchema = z.object({
  itens: z.array(cervejaCardSchema).max(6),
});

export type DestaquesResponse = z.infer<typeof destaquesResponseSchema>;
