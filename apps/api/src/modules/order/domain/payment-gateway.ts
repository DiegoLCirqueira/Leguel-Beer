export interface PaymentGateway {
  /**
   * Pergunta ao gateway se a cobrança do pedido foi aprovada e quando. Devolve `null` se não foi.
   * Se o gateway não responder, lança `PaymentGatewayUnavailableError`.
   */
  findApprovedPayment(orderId: string): Promise<{ approvedAt: Date } | null>;
}
