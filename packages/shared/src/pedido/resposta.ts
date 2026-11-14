import { z } from "zod";
import { numeroDoPedidoSchema } from "./numero.js";
import { statusDoPedidoSchema } from "./status.js";
import { VALIDADE_DO_PEDIDO_MINUTOS } from "./validade.js";

/** Forma de pagamento registrada no pedido. Nunca inclui o token do cartão. */
const pagamentoRegistradoSchema = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("pix") }),
  z.object({
    tipo: z.literal("cartao"),
    parcelas: z.int().min(1).max(12),
    bandeira: z.string().min(1),
  }),
]);

const itemDoPedidoSchema = z.object({
  cervejaId: z.string(),
  nome: z.string(),
  precoCentavos: z.int().nonnegative(),
  quantidade: z.int().positive(),
});

export const pedidoCriadoSchema = z
  .object({
    id: z.string().min(1),
    numero: numeroDoPedidoSchema,
    status: statusDoPedidoSchema,
    criadoEm: z.iso.datetime(),
    validoAte: z.iso.datetime(),
    pagamento: pagamentoRegistradoSchema,
    itens: z.array(itemDoPedidoSchema).min(1),
    subtotalCentavos: z.int().nonnegative(),
    freteCentavos: z.int().nonnegative(),
    totalCentavos: z.int().nonnegative(),
  })
  .refine(
    (p) =>
      p.subtotalCentavos === p.itens.reduce((soma, i) => soma + i.precoCentavos * i.quantidade, 0),
    { path: ["subtotalCentavos"], message: "O subtotal deve ser a soma dos itens." },
  )
  .refine((p) => p.totalCentavos === p.subtotalCentavos + p.freteCentavos, {
    path: ["totalCentavos"],
    message: "O total deve ser o subtotal mais o frete.",
  })
  .refine(
    (p) => Date.parse(p.validoAte) - Date.parse(p.criadoEm) === VALIDADE_DO_PEDIDO_MINUTOS * 60_000,
    { path: ["validoAte"], message: "A validade deve ser de 30 minutos desde a criação." },
  );

export type PedidoCriado = z.infer<typeof pedidoCriadoSchema>;
