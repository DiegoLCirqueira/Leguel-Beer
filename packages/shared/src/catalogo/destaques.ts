import { z } from "zod";
import { cervejaCardSchema } from "./cerveja-card.js";

export const destaquesResponseSchema = z.object({
  itens: z.array(cervejaCardSchema),
});

export type DestaquesResponse = z.infer<typeof destaquesResponseSchema>;
