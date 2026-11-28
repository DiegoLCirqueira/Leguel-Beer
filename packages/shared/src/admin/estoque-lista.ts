import { z } from "zod";

/** O selo "Baixo": disponível igual ou abaixo do mínimo. Regra única do resumo e da tela de Estoque. */
export function estoqueBaixoNoAdmin(disponivel: number, minimo: number): boolean {
  return disponivel <= minimo;
}

export const itemDoEstoqueSchema = z
  .object({
    cervejaId: z.string().min(1),
    nome: z.string().min(1),
    fisico: z.int().nonnegative(),
    reservado: z.int().nonnegative(),
    disponivel: z.int(),
    minimo: z.int().nonnegative(),
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

export const listaDoEstoqueSchema = z.object({ itens: z.array(itemDoEstoqueSchema) });
export type ListaDoEstoque = z.infer<typeof listaDoEstoqueSchema>;

export const TIPOS_DE_MOVIMENTO = [
  "entrada",
  "perda",
  "correcao",
  "venda",
  "cancelamento",
] as const;

export const movimentoDeEstoqueSchema = z.object({
  id: z.string().min(1),
  tipo: z.enum(TIPOS_DE_MOVIMENTO),
  /** Com sinal: positivo soma ao físico, negativo subtrai. */
  quantidade: z.int().refine((q) => q !== 0, { message: "O movimento não pode ser zero." }),
  motivo: z.string().nullable(),
  /** Saldo físico depois do movimento. */
  saldoFisico: z.int().nonnegative(),
  /** Número do pedido, nas vendas e nos cancelamentos. */
  numeroDoPedido: z.string().nullable(),
  criadoEm: z.iso.datetime(),
});

export type MovimentoDeEstoque = z.infer<typeof movimentoDeEstoqueSchema>;

export const historicoDoEstoqueSchema = z.object({ movimentos: z.array(movimentoDeEstoqueSchema) });
export type HistoricoDoEstoque = z.infer<typeof historicoDoEstoqueSchema>;
