import { z } from "zod";
import { ajusteDaGeladeiraSchema } from "../geladeira/ajuste.js";

export const CODIGOS_DE_ERRO_DO_PEDIDO = [
  "UNDERAGE",
  "BIRTH_DATE_REQUIRED",
  "PENDING_ORDER",
  "OUT_OF_DELIVERY_AREA",
  "EMPTY_FRIDGE",
  "TOTAL_CHANGED",
  "OUT_OF_STOCK",
  "IDEMPOTENCY_KEY_REUSED",
] as const;

const simples = (code: (typeof CODIGOS_DE_ERRO_DO_PEDIDO)[number]) =>
  z.object({ code: z.literal(code), message: z.string() });

export const erroDoPedidoSchema = z.discriminatedUnion("code", [
  simples("UNDERAGE"),
  simples("BIRTH_DATE_REQUIRED"),
  simples("OUT_OF_DELIVERY_AREA"),
  simples("EMPTY_FRIDGE"),
  simples("IDEMPOTENCY_KEY_REUSED"),
  z.object({ code: z.literal("PENDING_ORDER"), message: z.string(), pedidoId: z.string().min(1) }),
  z.object({
    code: z.literal("TOTAL_CHANGED"),
    message: z.string(),
    ajustes: z.array(ajusteDaGeladeiraSchema),
    totalAtualCentavos: z.int().nonnegative(),
  }),
  z.object({
    code: z.literal("OUT_OF_STOCK"),
    message: z.string(),
    cervejas: z.array(z.object({ cervejaId: z.string(), nome: z.string() })).min(1),
    ajustes: z.array(ajusteDaGeladeiraSchema),
  }),
]);

export type ErroDoPedido = z.infer<typeof erroDoPedidoSchema>;
