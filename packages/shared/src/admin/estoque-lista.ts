import { z } from "zod";
import { ESTOQUE_MAXIMO } from "./cerveja.js";

/** Teto dos inteiros de saída: o Int de 32 bits do banco. */
const INT32_MAXIMO = 2_147_483_647;
const contagem = z.int().nonnegative().max(INT32_MAXIMO);

/** O selo "Baixo": disponível igual ou abaixo do mínimo. Regra única do resumo e da tela de Estoque. */
export function estoqueBaixoNoAdmin(disponivel: number, minimo: number): boolean {
  return disponivel <= minimo;
}

export const itemDoEstoqueSchema = z
  .strictObject({
    cervejaId: z.string().min(1),
    nome: z.string().min(1),
    fisico: contagem,
    reservado: contagem,
    /** Nunca negativo: o físico não fica abaixo do reservado. */
    disponivel: contagem,
    minimo: contagem,
    baixo: z.boolean(),
  })
  .refine((item) => item.disponivel === item.fisico - item.reservado, {
    path: ["disponivel"],
    message: "Disponível é o físico menos o reservado.",
  })
  .refine((item) => item.baixo === estoqueBaixoNoAdmin(item.disponivel, item.minimo), {
    path: ["baixo"],
    message: "O selo Baixo segue a regra única do estoque.",
  });

export type ItemDoEstoque = z.infer<typeof itemDoEstoqueSchema>;

export const listaDoEstoqueSchema = z.strictObject({ itens: z.array(itemDoEstoqueSchema) });
export type ListaDoEstoque = z.infer<typeof listaDoEstoqueSchema>;

export const TIPOS_DE_MOVIMENTO = [
  "entrada",
  "perda",
  "correcao",
  "venda",
  "cancelamento",
] as const;

const base = {
  id: z.string().min(1),
  /** Saldo físico depois do movimento. */
  saldoFisico: contagem,
  criadoEm: z.iso.datetime(),
};

const motivo = z.string().trim().min(1).max(80);
const numeroDoPedido = z.string().regex(/^#LB\d{6}$/);
const positiva = z.int().positive().max(ESTOQUE_MAXIMO);
const negativa = z.int().negative().min(-ESTOQUE_MAXIMO);
const comSinal = z
  .int()
  .min(-ESTOQUE_MAXIMO)
  .max(ESTOQUE_MAXIMO)
  .refine((q) => q !== 0, {
    message: "O movimento não pode ser zero.",
  });

/** Cada tipo tem o seu sinal, o seu motivo e o seu pedido: entrada soma, perda e venda subtraem. */
export const movimentoDeEstoqueSchema = z.discriminatedUnion("tipo", [
  z.strictObject({
    ...base,
    tipo: z.literal("entrada"),
    quantidade: positiva,
    motivo,
    numeroDoPedido: z.null(),
  }),
  z.strictObject({
    ...base,
    tipo: z.literal("perda"),
    quantidade: negativa,
    motivo,
    numeroDoPedido: z.null(),
  }),
  z.strictObject({
    ...base,
    tipo: z.literal("correcao"),
    quantidade: comSinal,
    motivo,
    numeroDoPedido: z.null(),
  }),
  z.strictObject({
    ...base,
    tipo: z.literal("venda"),
    quantidade: negativa,
    motivo: z.null(),
    numeroDoPedido,
  }),
  z.strictObject({
    ...base,
    tipo: z.literal("cancelamento"),
    quantidade: positiva,
    motivo: z.null(),
    numeroDoPedido,
  }),
]);

export type MovimentoDeEstoque = z.infer<typeof movimentoDeEstoqueSchema>;

export const historicoDoEstoqueSchema = z.strictObject({
  movimentos: z.array(movimentoDeEstoqueSchema),
});
export type HistoricoDoEstoque = z.infer<typeof historicoDoEstoqueSchema>;
