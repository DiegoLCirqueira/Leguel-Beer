import type { StatusDoPedido } from "@leguele/shared";

/** O que a expiração precisa saber do pedido. */
export interface ExpirableOrder {
  id: string;
  status: StatusDoPedido;
  /** Criação + 30 minutos; vencido a partir deste instante. */
  expiresAt: Date;
}

export interface OrderRepository {
  /** Ids dos pedidos ainda aguardando pagamento cuja validade já passou em `at`. */
  findDueOrderIds(at: Date): Promise<string[]>;

  findForExpiration(orderId: string): Promise<ExpirableOrder | null>;

  /**
   * Cancela o pedido só se ele ainda aguarda pagamento, na mesma operação que libera a reserva,
   * descarta as baixas pendentes da Geladeira e grava o status anterior no histórico.
   * Devolve se cancelou: quem perde a corrida recebe `false` e não repete nada.
   */
  cancelIfAwaitingPayment(orderId: string, reason: string, at: Date): Promise<boolean>;
}
