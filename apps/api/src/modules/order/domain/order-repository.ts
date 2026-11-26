import type { StatusDoPedido } from "@leguele/shared";

/** O que a expiração precisa saber do pedido. */
export interface ExpirableOrder {
  id: string;
  status: StatusDoPedido;
  /** Criação + 30 minutos; vencido a partir deste instante. */
  expiresAt: Date;
}

export interface OrderRepository {
  /** Ids (os mais antigos primeiro, no máximo `limit`) dos pedidos aguardando pagamento cuja validade já passou em `at`. */
  findDueOrderIds(at: Date, limit: number): Promise<string[]>;

  findForExpiration(orderId: string): Promise<ExpirableOrder | null>;

  /**
   * Cancela o pedido só se ele ainda aguarda pagamento, na mesma operação que libera a reserva,
   * descarta as baixas pendentes da Geladeira e grava o status anterior no histórico.
   * Devolve se cancelou: quem perde a corrida recebe `false` e não repete nada.
   */
  cancelIfAwaitingPayment(orderId: string, reason: string, at: Date): Promise<boolean>;

  /**
   * Marca o pedido como pago só se ele ainda aguarda pagamento e a validade não passou em `at`, na
   * mesma operação que consome a reserva, baixa o estoque físico e a Geladeira da conta e grava o
   * histórico com `actorId`. Devolve se confirmou: quem perde a corrida recebe `false`.
   */
  confirmPaymentIfAwaiting(orderId: string, actorId: string, at: Date): Promise<boolean>;
}
